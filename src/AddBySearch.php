<?php
/*
 * AddBySearch
 * Description: Add related posts by searching
 */

namespace AddBySearch;

use Taco\Base as Base;
use Taco\Util\Arr as Arr;
use Taco\Util\Collection as Collection;
use Taco\Util\Color as Color;
use Taco\Util\Html as Html;
use Taco\Util\Num as Num;
use Taco\Util\Obj as Obj;
use Taco\Util\Str as Str;

class AddBySearch
{
  public static $should_load_frontend = false;
  public static $posts_json_object = null;

  public static function init()
  {
      if (self::getPostsData()) {
          self::$should_load_frontend = true;
          return;
      }
  }

  /**
   * Get json encoded data to used in Frontend
   */
  public static function getPostsData()
  {
      global $post;

      if (!$post) {
          return false;
      }
      if (!array_key_exists('post_type', $post)) {
          return false;
      }
      $class = str_replace(' ', '', ucwords(str_replace(Base::SEPARATOR, ' ', $post->post_type)));
      if (class_exists($class)) {
          $custom_post = \Taco\Post\Factory::create($post);
          $fields = $custom_post->getFields();
          $array_of_json_results = array();
          foreach ($fields as $k => $v) {
              if (array_key_exists('data-post-type', $fields[$k])) {
                  list($class, $method) = self::getPostTypeStructure($fields[$k]);
                  if (!strlen($class)) {
                      self::hideField();
                      return false;
                  }
                  $posts_helper = new $class;
                  // must be in the format of "id => title"
                  $pairs = $posts_helper->$method();
                  $existing_pairs = self::getExistingPairs($pairs, explode(',', $custom_post->get($k)));
                  $existing_ids = array_keys($existing_pairs);

                  if (!Arr::iterable($existing_ids)) {
                    	update_post_meta($custom_post->ID, $k, '');
                  } else {
                  		update_post_meta($custom_post->ID, $k, join(',', $existing_ids));
                  }
                  $array_of_json_results[$k] = $pairs;
              }
          }
          if (Arr::iterable($array_of_json_results)) {
              // save it for later when the front-end gets loaded
              self::$posts_json_object = json_encode($array_of_json_results);
              return true;
          }
          return false;
      }
  }


  private function getExistingPairs($pairs, $ids)
  {
      $existing_pairs = array();
      foreach ($ids as $id) {
          if (array_key_exists($id, $pairs)) {
              $existing_pairs[$id] = $pairs[$id];
          }
      }
      return $existing_pairs;
  }


  private function getPostTypeStructure($field)
  {
      $post_type_structure = explode('::', $field['data-post-type']);
      if (count($post_type_structure) === 1) {
          $post_type_structure[] = 'getPairs';
      }
      return $post_type_structure;
  }


  // If the class doesn't exist, hide the addbysearch field
  public static function hideField()
  {
      echo '<script>jQuery(function(){ jQuery(".addbysearch").closest("tr").hide();  })</script>';
  }


  /**
   * Check if an array of post or term ids exist in the database
   * @param array $ids_array comma seperated list of ids
   * @param bool $is_term are the ids term ids instead of post ids?
   * @return array
   */
  private static function getItemsIfExists($ids_array, $is_term = false)
  {
      global $wpdb;
      if ($is_term) {
          $results = $wpdb->get_results(
              sprintf(
                  "SELECT `term_id`
                   FROM `%s`",
                  $wpdb->terms
              ),
              ARRAY_A
          );
          $ids = Collection::pluck($results, 'term_id');
      } else {
          $results = $wpdb->get_results(
              sprintf(
                  "SELECT `ID`
                   FROM `%s`
                   WHERE `post_status` = 'publish'",
                   $wpdb->posts
              ),
              ARRAY_A
          );
          $ids = Collection::pluck($results, 'ID');
      }
      return array_intersect($ids_array, $ids);
  }


  /**
   * Get Taco Posts or Terms in the order specficied using a string of comma seperated ids
   * @param string $string_order comma seperated list of ids
   * @param bool $reverse should the collection be reversed
   * @param bool $is_term should the method return terms instead of posts
   * @param string $taxonomy if this method is returning terms, what taxonomy do they belong to
   * @param bool $load_terms should terms be loaded with posts
   * @return array
   */
  public static function getPostsFromOrder($string_order = '', $reverse = false, $is_term = false, $taxonomy = null, $load_terms = true)
  {
      if (!strlen($string_order)) {
          return array();
      }
      if (!preg_match('/\d+/', $string_order)) {
          return array();
      }
      $ids_array = explode(',', trim(strip_tags($string_order)));
      if (!$is_term) {
          $ids_array = self::getItemsIfExists($ids_array, $is_term);
          $items = \Taco\Post\Factory::createMultiple($ids_array, $load_terms);
      } else {
          $ids_array = self::getItemsIfExists($ids_array, true);
          $items = \Taco\Term\Factory::createMultiple($ids_array, $taxonomy);
      }
    
      $items = ($reverse) ? array_reverse($items) : $items;
      return (Arr::iterable($items)) ? $items : array();
  }


  // Load JavaScript and CSS
  public static function loadClientSide()
  {
      if (!self::$should_load_frontend) {
          return false;
      }

      echo '<script> var posts_json_results='.self::$posts_json_object.'</script>';

      wp_register_style('addbysearch_styles', '/addons/addbysearch/assets/css/addbysearch.css');
      wp_enqueue_style('addbysearch_styles');

      wp_register_script('addbysearch_js', '/addons/addbysearch/assets/js/addbysearch.js');
      wp_enqueue_script('addbysearch_js');
      return;
  }
}

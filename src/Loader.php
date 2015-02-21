<?php
namespace AddBySearch;
use \FrontendLoader\FrontendLoader;
class Loader
{
    public static function init()
    {
        add_action('admin_footer', 'AddBySearch\AddBySearch::init');
        add_filter('parse_query', function($query) {
          $files = array('addbysearch.js', 'addbysearch.css', 'icon-move.png');
          $front_end_loader = new FrontendLoader(
            'addons/addbysearch',
            dirname(__FILE__),
            array('addbysearch.js', 'addbysearch.css', 'icon-move.png'));
          $front_end_loader->fileServe($query);
          return $query;
        });
        return true;
    }
}

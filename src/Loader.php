<?php
namespace AddBySearch;
use \FrontendLoader\FrontendLoader;
class Loader
{
    public static function init()
    {
        add_action('admin_footer', 'AddBySearch\AddBySearch::init');
        add_filter('parse_query', function($query) {
          
          $front_end_loader = new FrontendLoader(
            'addons/addbysearch',
            dirname(__FILE__)
          );
          $front_end_loader->fileServe($query);
          return $query;
        });
        return true;
    }
}

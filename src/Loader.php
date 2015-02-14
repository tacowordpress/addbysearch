<?php
namespace AddBySearch;

class Loader
{
    public static function init()
    {
        add_action('admin_footer', 'AddBySearch\AddBySearch::init');
        add_filter('parse_query', 'AddBySearch\Frontend\Loader::fileServe');
        return true;
    }
}

<?php
namespace AddBySearch;

class Loader
{
    public static function init()
    {
        add_action('admin_footer', 'AddBySearch\AddBySearch::init');
        add_action('shutdown', 'AddBySearch\Frontend\Loader::addToHTML');
        return true;
    }
}

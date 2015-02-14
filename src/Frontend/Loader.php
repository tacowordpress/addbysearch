<?php
namespace AddBySearch\Frontend;

use Taco\Util\Arr as Arr;
use Taco\Util\Collection as Collection;
use Taco\Util\Color as Color;
use Taco\Util\Html as Html;
use Taco\Util\Num as Num;
use Taco\Util\Obj as Obj;
use Taco\Util\Str as Str;


/**
 * Loads frontend code like HTML, CSS, and JS
 */
class Loader
{

    /**
     * Is the user currently viewing an HTML page?
     * Things that are not HTML would be admin-ajax.php for instance
     * @return bool
     */
    public static function isViewingHTMLPage()
    {
        if (!is_admin()) return false;
        if (!array_key_exists('SCRIPT_NAME', $_SERVER)) return false;
        
        $whitelisted_script_names = array(
            '/wp-admin/post-new.php',
            '/wp-admin/post.php',
            '/wp-admin/edit.php',
        );
        if (!in_array($_SERVER['SCRIPT_NAME'], $whitelisted_script_names)) {
            return false;
        }

        return true;
    }


    /**
     * Get an array of namespaces this file resides in
     * @return array
     */
    public static function getNameSpaceArray() {
        return array_reverse(explode('\\', __NAMESPACE__));
    }


    /**
     * Return the content type for a file to be used with header()
     * @param string $file_name
     * @return string bool
     */
    public static function getContentType($file_name)
    {
        $file_extension = strtolower(substr(strrchr($file_name,"."), 1));
        switch($file_extension) {
            case "gif": return "image/gif";
            case "png": return "image/png";
            case "jpeg":
            case "jpg": return "image/jpg";
            case "css": return "text/css";
            case "js":  return "application/javascript";
            default:
        }
        return false;
    }


    /**
     * Return the folder name for a given file
     * @param string $file_name
     * @return string bool
     */
    public static function getAssetFolderName($file_name)
    {
        $file_extension = strtolower(substr(strrchr($file_name,"."), 1));
        if(preg_match('/jpg|jpeg|gif|png/', $file_extension)) {
            return 'img';
        }
        if($file_extension === 'js') {
            return 'js';
        }
        if($file_extension === 'css') {
            return 'css';
        }
        return false;
    }


    /**
     * Determine the path for an asset using the query string
     * @return string bool
     */
    public static function getAssetPath() {
        $url_frags = parse_url($_SERVER['REQUEST_URI']);
        if (!array_key_exists('query', $url_frags)) return false;
        parse_str($url_frags['query'], $query_vars);
        if (!array_key_exists('asset', $query_vars)) return false;
        $folder_name = self::getAssetFolderName($query_vars['asset']);
        $file_name = sprintf(
            dirname(__FILE__).'/assets/%s/%s',
            $folder_name,
            $query_vars['asset']
        );
        if (file_exists($file_name)) {
           return $file_name;
        }
        return $false;
    }


    /**
     * Return a file given the query string
     * @param array $query - wordpress passes this in and must be returned
     * @return file
     */
    public static function fileServe($query)
    {
        if (!array_key_exists('REQUEST_URI', $_SERVER)) return $query;
        $folder_plugin_namespace = Str::machine(next(self::getNameSpaceArray()));
        if (!preg_match("/addons\/$folder_plugin_namespace\/assets\/(.*)$/", $_SERVER['REQUEST_URI'])) return $query;

        $file_name = self::getAssetPath();
        if (!$file_name) return $query;

        $content_type = self::getContentType($file_name);
        header('Content-type: ' . $content_type);
        header('Content-Length: ' . filesize($file_name));
        http_response_code(200);
        readfile($file_name);
        exit;
        return $query;
    }
}

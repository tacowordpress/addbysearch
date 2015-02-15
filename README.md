# addbysearch
AddBySearch is a Wordpress Taco add-on that allows you to easily assign relationships to other posts as well as order them. 

Docs: http://tacowordpress.github.io/addbysearch/

## Setup

1. Plese make sure to install the dependency of Taco first. https://github.com/tacowordpress/tacowordpress/
2. Add AddBySearch to your composer.json file right after Taco:

        {
          "require": {
            "tacowordpress/tacowordpress: "dev-master"
            "tacowordpress/addbysearch": "dev-master"
          }
        }
        
3. Initialize AddBySearch in functions.php right after Taco

        // Initialize Taco
        \Taco\Loader::init();
        
        // Initialize AddBySearch
        \AddBySearch\Loader::init();

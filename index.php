<?php 
    require_once 'core/translater.php';
    require_once 'core/dbConnection.php';
    
    $t = new Translater();
    $t->setLanguage("Ukrainian");
    
    function __($text) {
        global $t;
        
        if($t->getLngIndex() == -1) {
            return $text;
        }
        
        $phraseText = $t->phrases[$text][$t->getLngIndex()];
        
        if(!$phraseText) {
            $phraseText = $text;
        }
        
        return $phraseText;
    }
    
    include("mainPage.phtml");
?>
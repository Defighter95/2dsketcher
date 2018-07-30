<?php

$p->x = (sin(M_PI * $t) * getCircleRadius($elem) + $p1->x);
$p->y = (cos(M_PI * $t) * getCircleRadius($elem) + $p1->y);
// ...
addCommand("N" . $codeNumCounter . " X" . ($p->x) . " Y" . ($p->y));
// ...
// circle interpolation
addCommand("N" . $codeNumCounter . " G02" .
        " X" . (($elem->points[1]->x) + 2 * (($elem->points[0]->x) - ($elem->points[1]->x))) .
        " Y" . (($elem->points[1]->y) + 2 * (($elem->points[0]->y) - ($elem->points[1]->y))) .
        " R" . (getCircleRadius($elem))
);



$p->x = $elem->points[1]->x;
$p->y = $elem->points[1]->y;
// ...
addCommand("N" . $codeNumCounter . " X" . ($p->x) . " Y" . ($p->y));



$p->x = (sin(M_PI * $t) * getEllipseXRadius($elem) + $p1->x);
$p->y = (cos(M_PI * $t) * getEllipseYRadius($elem) + $p1->y);
// ...
addCommand("N" . $codeNumCounter . " X" . ($p->x) . " Y" . ($p->y));
addCommand("N" . $codeNumCounter . " G01" . " Z-" . $zDeep);


// ...
// $sideNumber = номер елементу (проходу): 0,2,.. - для сторін, 1, 3, 5 - для кутів 
switch ($sideNumber) {
    case 1:
        if (!$useCircularInterpolation) {
            $p->x = (sin($startAngel + M_PI * $t) * $elem->cr + 
                    (max($elem->points[0]->x, $elem->points[1]->x) - +$elem->cr));
            $p->y = (cos($startAngel + M_PI * $t) * $elem->cr + 
                    (max($elem->points[0]->y, $elem->points[1]->y) - +$elem->cr));
        } else {
            $p->x = max($elem->points[0]->x, $elem->points[1]->x);
            $p->y = max($elem->points[0]->y, $elem->points[1]->y) - +$elem->cr;
        }
        break;
}
// ...
if (!$useCircularInterpolation) {
    addCommand("N" . $t . " " . $codeNumCounter . " X" . $p->x . " Y" . $p->y);
} else {
    addCommand("N" . $codeNumCounter . " G02" . " X" . ($p->x) . " Y" . ($p->y) . " R" . ($elem->cr));
    addCommand("N" . $codeNumCounter . " G01");
    $t = 1 / 2;
}
// ...
switch ($sideNumber) {
    case 0:
        addCommand("N" . $codeNumCounter . 
                " X" . (max($elem->points[0]->x, $elem->points[1]->x) - +$elem->cr) . 
                " Y" . max($elem->points[0]->y, $elem->points[1]->y));
        break;
}




// ...
$p->x = pow(1 - $t, 2) * $p1->x + 2 * (1 - $t) * $t * $p2->x + pow($t, 2) * $p3->x;
                $p->y = pow(1 - $t, 2) * $p1->y + 2 * (1 - $t) * $t * $p2->y + pow($t, 2) * $p3->y;
// ...
                addCommand("N" . $codeNumCounter . " X" . ($p->x) . " Y" . ($p->y));


// ...              
                $p->x = pow(1 - $t, 3) * $p1->x + 3 * pow(1 - $t, 2) * $t * $p2->x + 3 * (1 - $t) * 
                        pow($t, 2) * $p3->x + pow($t, 3) * $p4->x;
                $p->y = pow(1 - $t, 3) * $p1->y + 3 * pow(1 - $t, 2) * $t * $p2->y + 3 * (1 - $t) * 
                        pow($t, 2) * $p3->y + pow($t, 3) * $p4->y;

// ...  
                addCommand("N" . $codeNumCounter . " X" . ($p->x) . " Y" . ($p->y));

$fooBar = 2;

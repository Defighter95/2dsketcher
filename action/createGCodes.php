<?php

require_once 'GProgramm.php';

error_reporting(E_ERROR | E_PARSE);

$p = new GProgramm();

$cProgramm;
$codeNumCounter = 10;

function getCircleRadius($circle) {
    return sqrt(pow($circle->points[1]->x - $circle->points[0]->x, 2) + pow($circle->points[1]->y - $circle->points[0]->y, 2));
}

function getEllipseXRadius($ellipse) {
    return sqrt(pow($ellipse->points[1]->x - $ellipse->points[0]->x, 2));
}

function getEllipseYRadius($ellipse) {
    return sqrt(pow($ellipse->points[2]->y - $ellipse->points[0]->y, 2));
}

function addCommand($command, $inc = true) {
    global $cProgramm;
    global $codeNumCounter;

    $cProgramm .= $command . "\n";

    if ($inc) {
        $codeNumCounter += 10;
    }
}

$elems = json_decode($_POST['elements']);
$sketch = json_decode($_POST['sketch']);
$hardware = json_decode($_POST['hardware']);
$svg = json_decode($_POST['svg']);

//print_r($elems);


$step = $sketch->interpolationStep;
$zDeep = $sketch->materialDeep;
$useCircularInterpolation = $sketch->useCircularInterpolation;

$speed = $hardware->speed;

$spindelRotationSpeed = intval(($speed) / ( M_PI * $hardware->dreelSize));

addCommand("%", false);

addCommand("O0001 (" . strtoupper($sketch->name) . ")", false);
addCommand("", false);

if($sketch->useWorkCoords) {
    addCommand("N" . $codeNumCounter . " G54" . " X" . $sketch->workCoords->x . " Y" . $sketch->workCoords->y);
}

addCommand("N" . $codeNumCounter . " G21 G40 G49 G54 G80 G90");

if($sketch->toInch){
    addCommand("N" . $codeNumCounter . " G20");
}
addCommand("", false);

addCommand("N" . $codeNumCounter . " F" . $hardware->speed);

if ($hardware->compDeviceLength) {
    addCommand("N" . $codeNumCounter . " G43" . " H" . $hardware->dreelNumber);
}

addCommand("N" . $codeNumCounter . " M" . (($hardware->rotation == 1) ? "03" : "04") . " S" . $spindelRotationSpeed);

addCommand("N" . $codeNumCounter . " G41 D" . $hardware->dreelNumber);
addCommand("N" . $codeNumCounter . " G42 D" . $hardware->dreelNumber);

foreach ($elems as $elem) {

    if ($hardware->coolantSupply) {
        addCommand("N" . $codeNumCounter . " М09");
    }

    if ($sketch->useChoosedStop) {
        addCommand("N" . $codeNumCounter . " М01");
    }
    
    addCommand("", false);

    addCommand("N" . $codeNumCounter . " G00" . " Z5");
    addCommand("(" . strtoupper($elem->name) . ")");

    switch ($elem->type) {
        case 'qBizier':
            addCommand("N" . $codeNumCounter . " X" . ($elem->points[0]->x) . " Y" . ($elem->points[0]->y));
            addCommand("N" . $codeNumCounter . " G01" . " Z-" . $zDeep);

            if ($hardware->coolantSupply) {
                addCommand("N" . $codeNumCounter . " М08");
            }
            
            addCommand("", false);

            $p1->x = $elem->points[0]->x;
            $p1->y = $elem->points[0]->y;

            $p2->x = $elem->points[2]->x;
            $p2->y = $elem->points[2]->y;

            $p3->x = $elem->points[1]->x;
            $p3->y = $elem->points[1]->y;

            $lastPointIndex = 2;
            $loopedPoint = ($elem->looped) ? false : true;

            $t = $step;

            while (true) {
                $p->x = pow(1 - $t, 2) * $p1->x + 2 * (1 - $t) * $t * $p2->x + pow($t, 2) * $p3->x;
                $p->y = pow(1 - $t, 2) * $p1->y + 2 * (1 - $t) * $t * $p2->y + pow($t, 2) * $p3->y;

                addCommand("N" . $codeNumCounter . " X" . ($p->x) . " Y" . ($p->y));

                if ($t >= 1) {
                    $lastPointIndex++;
                    $t = $step;
                    addCommand("", false);

                    if ($lastPointIndex > count($elem->points) - 1) {
                        if (!$loopedPoint) {
                            $loopedPoint = true;
                            $p1 = $p3;

                            $p2->x = $p1->x + ($p1->x - $p2->x);
                            $p2->y = $p1->y + ($p1->y - $p2->y);

                            $p3 = $elem->points[0];
                        } else {
                            break;
                        }
                    } else {
                        $p1 = $p3;

                        $p2->x = $p1->x + ($p1->x - $p2->x);
                        $p2->y = $p1->y + ($p1->y - $p2->y);

                        $p3 = $elem->points[$lastPointIndex];
                    }
                } else {
                    if (($t + $step) <= 1) {
                        $t += $step;
                    } else {
                        $t = 1;
                    }
                }
            }
            break;
        case 'cBizier':
            addCommand("N" . $codeNumCounter . " X" . ($elem->points[1]->x) . " Y" . ($elem->points[1]->y));
            addCommand("N" . $codeNumCounter . " G01" . " Z-" . $zDeep);

            if ($hardware->coolantSupply) {
                addCommand("N" . $codeNumCounter . " М08");
            }
            addCommand("", false);

            $p1->x = $elem->points[1]->x;
            $p1->y = $elem->points[1]->y;

            $p2->x = $elem->points[0]->x;
            $p2->y = $elem->points[0]->y;

            $p3->x = $elem->points[2]->x;
            $p3->y = $elem->points[2]->y;

            $p4->x = $elem->points[3]->x;
            $p4->y = $elem->points[3]->y;

            $lastPointIndex = 3;
            $loopedPoint = ($elem->looped) ? false : true;

            $t = $step;

            while (true) {

                $p->x = pow(1 - $t, 3) * $p1->x + 3 * pow(1 - $t, 2) * $t * $p2->x + 3 * (1 - $t) * pow($t, 2) * $p3->x + pow($t, 3) * $p4->x;
                $p->y = pow(1 - $t, 3) * $p1->y + 3 * pow(1 - $t, 2) * $t * $p2->y + 3 * (1 - $t) * pow($t, 2) * $p3->y + pow($t, 3) * $p4->y;

                addCommand("N" . $codeNumCounter . " X" . ($p->x) . " Y" . ($p->y));

                if ($t >= 1) {
                    $lastPointIndex += 2;
                    $t = $step;
                    addCommand("", false);
                    
                    if ($lastPointIndex > count($elem->points) - 1) {
                        if (!$loopedPoint) {
                            $loopedPoint = true;
                            $p1 = $p4;

                            $p2->x = $p1->x + ($p1->x - $p3->x);
                            $p2->y = $p1->y + ($p1->y - $p3->y);

                            $contolPoint->x = $elem->points[1]->x - ($elem->points[3]->x - $elem->points[2]->x);
                            $contolPoint->y = $elem->points[1]->y + ($elem->points[3]->y - $elem->points[2]->y);


                            $p3 = $contolPoint;
                            $p4 = $elem->points[1];
                        } else {
                            break;
                        }
                    } else {
                        $p1 = $p4;

                        $p2->x = $p1->x + ($p1->x - $p3->x);
                        $p2->y = $p1->y + ($p1->y - $p3->y);

                        $p3 = $elem->points[$lastPointIndex - 1];
                        $p4 = $elem->points[$lastPointIndex];
                    }
                } else {
                    if (($t + $step) <= 1) {
                        $t += $step;
                    } else {
                        $t = 1;
                    }
                }
            }

            break;
        case 'pLine':
            addCommand("N" . $codeNumCounter . " X" . ($elem->points[0]->x) . " Y" . ($elem->points[0]->y));
            addCommand("N" . $codeNumCounter . " G01" . " Z-" . $zDeep);

            if ($hardware->coolantSupply) {
                addCommand("N" . $codeNumCounter . " М08");
            }
            addCommand("", false);

            $lastPointIndex = 1;
            $loopedPoint = ($elem->looped) ? false : true;

            $p->x = $elem->points[1]->x;
            $p->y = $elem->points[1]->y;

            while (true) {
                addCommand("N" . $codeNumCounter . " X" . ($p->x) . " Y" . ($p->y));

                $lastPointIndex++;
                $t = $step;

                if ($lastPointIndex > count($elem->points) - 1) {
                    if (!$loopedPoint) {
                        $loopedPoint = true;
                        $p = $elem->points[0];
                    } else {
                        break;
                    }
                } else {
                    $p = $elem->points[$lastPointIndex];
                }
            }

            break;
        case 'circle':

            if (!$useCircularInterpolation) {
                $p1->x = $elem->points[0]->x;
                $p1->y = $elem->points[0]->y;

                $t = 0;
                $firstStep = true;

                while (true) {

                    $p->x = (sin(M_PI * $t) * getCircleRadius($elem) + $p1->x);
                    $p->y = (cos(M_PI * $t) * getCircleRadius($elem) + $p1->y);

                    if ($firstStep) {
                        $firstStep = false;

                        addCommand("N" . $codeNumCounter . " X" . ($p->x) . " Y" . ($p->y));
                        addCommand("N" . $codeNumCounter . " G01" . " Z-" . $zDeep);

                        if ($hardware->coolantSupply) {
                            addCommand("N" . $codeNumCounter . " М08");
                        }
                        addCommand("", false);
                    } else {
                        addCommand("N" . $codeNumCounter . " X" . ($p->x) . " Y" . ($p->y));
                    }             

                    if ($t >= (2 - $step)) {
                        break;
                    } else {
                        if (($t + $step) <= 2) {
                            $t += $step;
                        } else {
                            $t = 2;
                        }
                    }
                }
            } else {
                addCommand("N" . $codeNumCounter . " G02" . " X" . (($elem->points[1]->x) + 2 * (($elem->points[0]->x) - ($elem->points[1]->x))) . " Y" . (($elem->points[1]->y) + 2 * (($elem->points[0]->y) - ($elem->points[1]->y))) . " R" . (getCircleRadius($elem)));
                addCommand("N" . $codeNumCounter . " X" . ($elem->points[1]->x) . " Y" . ($elem->points[1]->y) . " R" . (getCircleRadius($elem)));
            }
            break;
        case 'ellipse':

            $p1->x = $elem->points[0]->x;
            $p1->y = $elem->points[0]->y;

            $t = 0;
            $firstStep = true;

            while (true) {

                $p->x = (sin(M_PI * $t) * getEllipseXRadius($elem) + $p1->x);
                $p->y = (cos(M_PI * $t) * getEllipseYRadius($elem) + $p1->y);

                if ($firstStep) {
                    $firstStep = false;

                    addCommand("N" . $codeNumCounter . " X" . ($p->x) . " Y" . ($p->y));
                    addCommand("N" . $codeNumCounter . " G01" . " Z-" . $zDeep);

                    if ($hardware->coolantSupply) {
                        addCommand("N" . $codeNumCounter . " М08");
                    }
                    addCommand("", false);
                } else {
                    addCommand("N" . $codeNumCounter . " X" . ($p->x) . " Y" . ($p->y));
                }

                if ($t >= 2) {
                    break;
                } else {
                    if (($t + $step) <= 2) {
                        $t += $step;
                    } else {
                        $t = 2;
                    }
                }
            }
            break;
        case 'rectangle':
            addCommand("N" . $codeNumCounter . " X" . (min($elem->points[0]->x, $elem->points[1]->x) + +$elem->cr) . " Y" . (max($elem->points[0]->y, $elem->points[1]->y)));
            addCommand("N" . $codeNumCounter . " G01" . " Z-" . $zDeep);

            if ($hardware->coolantSupply) {
                addCommand("N" . $codeNumCounter . " М08");
            }
            addCommand("", false);

            $t = $step;

            $sideNumber = 0;
            $startAngel = 0;

            while (true) {

                if (($sideNumber % 2)) {

                    switch ($sideNumber) {
                        case 1:
                            if (!$useCircularInterpolation) {
                                $p->x = (sin($startAngel + M_PI * $t) * $elem->cr + (max($elem->points[0]->x, $elem->points[1]->x) - +$elem->cr));
                                $p->y = (cos($startAngel + M_PI * $t) * $elem->cr + (max($elem->points[0]->y, $elem->points[1]->y) - +$elem->cr));
                            } else {
                                $p->x = max($elem->points[0]->x, $elem->points[1]->x);
                                $p->y = max($elem->points[0]->y, $elem->points[1]->y) - +$elem->cr;
                            }
                            break;
                        case 3:
                            if (!$useCircularInterpolation) {
                                $p->x = (sin($startAngel + M_PI * $t) * $elem->cr + (max($elem->points[0]->x, $elem->points[1]->x) - +$elem->cr));
                                $p->y = (cos($startAngel + M_PI * $t) * $elem->cr + (min($elem->points[0]->y, $elem->points[1]->y) + +$elem->cr));
                            } else {
                                $p->x = max($elem->points[0]->x, $elem->points[1]->x) - +$elem->cr;
                                $p->y = min($elem->points[0]->y, $elem->points[1]->y);
                            }
                            break;
                        case 5:
                            if (!$useCircularInterpolation) {
                                $p->x = (sin($startAngel + M_PI * $t) * $elem->cr + (min($elem->points[0]->x, $elem->points[1]->x) + +$elem->cr));
                                $p->y = (cos($startAngel + M_PI * $t) * $elem->cr + (min($elem->points[0]->y, $elem->points[1]->y) + +$elem->cr));
                            } else {
                                $p->x = min($elem->points[0]->x, $elem->points[1]->x);
                                $p->y = min($elem->points[0]->y, $elem->points[1]->y) + +$elem->cr;
                            }
                            break;
                        case 7:
                            if (!$useCircularInterpolation) {
                                $p->x = (sin($startAngel + M_PI * $t) * $elem->cr + (min($elem->points[0]->x, $elem->points[1]->x) + +$elem->cr));
                                $p->y = (cos($startAngel + M_PI * $t) * $elem->cr + (max($elem->points[0]->y, $elem->points[1]->y) - +$elem->cr));
                            } else {
                                $p->x = min($elem->points[0]->x, $elem->points[1]->x) + +$elem->cr;
                                $p->y = max($elem->points[0]->y, $elem->points[1]->y);
                            }
                            break;
                    }

                    if ($elem->cr == 0) {
                        $t = M_PI;
                    } else {
                        if (!$useCircularInterpolation) {
                            addCommand("N" . $t . " " . $codeNumCounter . " X" . $p->x . " Y" . $p->y);
                        } else {
                            addCommand("N" . $codeNumCounter . " G02" . " X" . ($p->x) . " Y" . ($p->y) . " R" . ($elem->cr));
                            addCommand("N" . $codeNumCounter . " G01");
                            $t = 1 / 2;
                        }
                    }
                } else {
                    switch ($sideNumber) {
                        case 0:
                            addCommand("N" . $codeNumCounter . " X" . (max($elem->points[0]->x, $elem->points[1]->x) - +$elem->cr) . " Y" . max($elem->points[0]->y, $elem->points[1]->y));
                            break;
                        case 2:
                            addCommand("N" . $codeNumCounter . " X" . (max($elem->points[0]->x, $elem->points[1]->x)) . " Y" . (min($elem->points[0]->y, $elem->points[1]->y) + +$elem->cr));
                            break;
                        case 4:
                            addCommand("N" . $codeNumCounter . " X" . (min($elem->points[0]->x, $elem->points[1]->x) + +$elem->cr) . " Y" . (min($elem->points[0]->y, $elem->points[1]->y)));
                            break;
                        case 6:
                            addCommand("N" . $codeNumCounter . " X" . (min($elem->points[0]->x, $elem->points[1]->x)) . " Y" . (max($elem->points[0]->y, $elem->points[1]->y) - +$elem->cr));
                            break;
                    }

                    $t = 1 / 2;
                }

                if ((M_PI * $t) >= (M_PI_2)) {
                    $sideNumber++;
                    $t = $step;
                    addCommand("", false);

                    if ($sideNumber > 7) {
                        break;
                    } else {
                        switch ($sideNumber) {
                            case 3:
                                $startAngel = M_PI_2;
                                break;
                            case 5:
                                $startAngel = M_PI;
                                break;
                            case 7:
                                $startAngel = -M_PI_2;
                                break;
                        }
                    }
                } else {
                    if (M_PI * ($t + $step) <= M_PI_2) {
                        $t += $step;
                    } else {
                        $t = (1 / 2);
                    }
                }
            }
            break;
    }

    addCommand("(END OF " . strtoupper($elem->name) . ")");
}

if ($hardware->coolantSupply) {
    addCommand("N" . $codeNumCounter . " М09");
}

addCommand("N" . $codeNumCounter . " G40");

addCommand("N" . $codeNumCounter . " G49");

addCommand("N" . $codeNumCounter . " M05");
addCommand("N" . $codeNumCounter . " M30");

addCommand("", false);

addCommand("N" . $codeNumCounter . " G91" . " X0 Y0 Z0");

addCommand("%", false);



//print_r($cProgramm);

$fileName = strtolower(str_replace(" ", "", $sketch->name)) . date ("dmYHis") . ".txt";

$fp = fopen("codes/" . $fileName, 'w');
fwrite($fp, $cProgramm);
fclose($fp);


//print_r($totalData);

echo json_encode(["fileName" => $fileName]);


<?php

$http_origin = $_SERVER['HTTP_ORIGIN'];

if ($http_origin == "https://learn2.open.ac.uk" || $http_origin == "http://learn3.open.ac.uk") {
    header("Access-Control-Allow-Origin: $http_origin");
}
header("Access-Control-Allow-Credentials: true ");
header("Access-Control-Allow-Methods: OPTIONS, GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control");

putenv('GDFONTPATH=' . realpath('.'));

$ob = new mindMap();

$ob->generatePrint();

class mindMap {

    private $json;
    private $img;
    private $width = 0;
    private $height = 0;
    private $rad = 5;
    private $col1 = '#0089C5';
    private $col2 = '#CA7F1B';
    private $black;
    private $white;
    private $minYl = array();
    private $minYr = array();
    private $parentX = 0;
    private $parentY = 0;
    private $a4dpi300w = 655;
    private $a4dpi300h = 842;
    private $pageSize = 'A4';
    private $a3w = 842;
    private $a3h = 1191;
    private $landscape = false;
    private $pW;
    private $pH;
    private $font = './arial.ttf';
    private $imgW = 0;
    private $onlyImg = false;

    public function __construct() {

        if (!isset($_POST) || !isset($_POST['print']) || !isset($_POST['width']) || !isset($_POST['height'])) {
            die('0');
        }
        if (isset($_POST['pictureSize'])) {
            $this->imgW = filter_input(INPUT_POST, 'pictureSize', FILTER_VALIDATE_INT);
            $this->onlyImg = true;
        }

        $st = filter_input(INPUT_POST, 'print');
        //$st = '{"id":1396967953689,"title":"333333","map":[{"id":0,"title":"Begin yor journey333","posX":736.5,"posY":335,"style":1,"toRight":1,"map":[{"id":3,"title":"dsfdsfdsfdsfdsf1177 df dsf","posX":995.5,"posY":275.5,"style":2,"toRight":1,"map":[{"id":32,"title":"dfdsfdsfdsfd","posX":1308.5,"posY":75,"style":2,"toRight":1,"map":[],"width":135,"height":37},{"id":33,"title":"dfsddsfsd","posX":1308.5,"posY":157,"style":2,"toRight":1,"map":[{"id":36,"title":"dsfdsfdsf","posX":1621.5,"posY":127.5,"style":2,"toRight":1,"map":[],"width":107,"height":37},{"id":51,"title":"fgfdg#","posX":1621.5,"posY":182.5,"style":2,"toRight":1,"map":[],"width":82,"height":37}],"width":112,"height":37},{"id":31,"title":"dsfdsfdsfdsfds","posX":1308.5,"posY":212,"style":2,"toRight":1,"map":[],"width":155,"height":37},{"id":34,"title":"dffdsfdsfds11","posX":1308.5,"posY":267,"style":2,"toRight":1,"map":[{"id":45,"title":"sdasdasd","posX":1621.5,"posY":321.5,"style":2,"toRight":1,"map":[{"id":46,"title":"sadsadsa","posX":1784.5,"posY":263.5,"style":2,"toRight":1,"map":[],"width":108,"height":37},{"id":29,"title":"fdsfsdfsd","posX":1784.5,"posY":318.5,"style":2,"toRight":1,"map":[],"width":107,"height":37},{"id":14,"title":"fgfdgfd","posX":1784.5,"posY":373.5,"style":2,"toRight":1,"map":[],"width":88,"height":37}],"width":109,"height":37}],"width":146,"height":37},{"id":44,"title":"dsfdsfdsf","posX":1308.5,"posY":322,"style":2,"toRight":1,"map":[],"width":107,"height":37},{"id":43,"title":"sadsadsa","posX":1308.5,"posY":395,"style":2,"toRight":1,"map":[{"id":50,"title":"ddfds","posX":1621.5,"posY":394,"style":2,"toRight":1,"map":[],"width":75,"height":37}],"width":108,"height":37},{"id":17,"title":"fgfdgfdgfdg","posX":1308.5,"posY":450,"style":2,"toRight":1,"map":[],"width":127,"height":37},{"id":56,"title":"dsfdsfdsfdsfdsf1177 df dsf","posX":1308.5,"posY":505,"style":2,"toRight":1,"map":[],"width":259,"height":37}],"width":259,"height":37},{"id":4,"title":"dfsdfdsfdsfds","posX":995.5,"posY":330.5,"style":2,"toRight":1,"map":[],"width":145,"height":37},{"id":13,"title":"Nice flower :)","posX":995.5,"posY":385.5,"style":2,"toRight":1,"map":[],"width":136,"height":37},{"id":15,"title":"fgfdgfdgfgfd","posX":575.5,"posY":190,"style":2,"toRight":0,"map":[{"id":21,"title":"fdsfdsfs","posX":420.5,"posY":159,"style":2,"toRight":0,"map":[{"id":22,"title":"sdfdsfdsfds","posX":216.5,"posY":101,"style":2,"toRight":0,"map":[],"width":128,"height":37},{"id":23,"title":"vfdgdgfd","posX":242.5,"posY":154.5,"style":2,"toRight":0,"map":[{"id":55,"title":"sdsdsd","posX":73.5,"posY":153.5,"style":2,"toRight":0,"map":[],"width":89,"height":37}],"width":102,"height":37},{"id":24,"title":"fgfdgd","posX":262.5,"posY":209.5,"style":2,"toRight":0,"map":[],"width":82,"height":37}],"width":96,"height":37},{"id":25,"title":"dsfsdfds","posX":415.5,"posY":214,"style":2,"toRight":0,"map":[],"width":101,"height":37},{"id":26,"title":"sdfdsfdsf","posX":409.5,"posY":269,"style":2,"toRight":0,"map":[],"width":107,"height":37},{"id":27,"title":"fdsdfdsfds","posX":398.5,"posY":324,"style":2,"toRight":0,"map":[],"width":118,"height":37}],"width":133,"height":37},{"id":10,"title":"fdsdfsdfds","posX":590.5,"posY":245,"style":2,"toRight":0,"map":[],"width":118,"height":37},{"id":11,"title":"dfdsfdsfdsf","posX":584.5,"posY":300,"style":2,"toRight":0,"map":[],"width":124,"height":37},{"id":16,"title":"fgfdgfdgfdgd","posX":570.5,"posY":355,"style":2,"toRight":0,"map":[],"width":138,"height":37},{"id":18,"title":"fgdfgfdgfd","posX":592.5,"posY":410,"style":2,"toRight":0,"map":[],"width":116,"height":37},{"id":20,"title":"fgfdgfdgfd","posX":592.5,"posY":465,"style":2,"toRight":0,"map":[],"width":116,"height":37},{"id":19,"title":"fdgfdgfdgfd","posX":581.5,"posY":520,"style":2,"toRight":0,"map":[],"width":127,"height":37},{"id":40,"title":"gfdgfd g","posX":610.5,"posY":575,"style":2,"toRight":0,"map":[],"width":98,"height":37},{"id":9,"title":"Drop here","posX":995.5,"posY":440.5,"style":2,"toRight":1,"map":[],"width":111,"height":37},{"id":41,"title":"sdfsdfsdfds","posX":995.5,"posY":495.5,"style":2,"toRight":1,"map":[],"width":128,"height":37},{"id":7,"title":"fsdfdsfdsds","posX":995.5,"posY":578.5,"style":2,"toRight":1,"map":[{"id":8,"title":"dfdsfdsfdsf","posX":1308.5,"posY":577.5,"style":2,"toRight":1,"map":[{"id":37,"title":"dsfdsfds","posX":1486.5,"posY":548,"style":2,"toRight":1,"map":[],"width":101,"height":37},{"id":38,"title":"dsfdsfdsf","posX":1486.5,"posY":603,"style":2,"toRight":1,"map":[{"id":39,"title":"adfdsfds","posX":1647.5,"posY":602,"style":2,"toRight":1,"map":[],"width":101,"height":37}],"width":107,"height":37}],"width":124,"height":37}],"width":128,"height":37},{"id":6,"title":"fdffdsfdsfdsf","posX":995.5,"posY":633.5,"style":2,"toRight":1,"map":[],"width":136,"height":37},{"id":53,"title":"dddddd","posX":995.5,"posY":688.5,"style":2,"toRight":1,"map":[],"width":92,"height":37},{"id":52,"title":"dfdsfdsf","posX":995.5,"posY":743.5,"style":2,"toRight":1,"map":[],"width":97,"height":37},{"id":57,"title":"edfsf","posX":995.5,"posY":798.5,"style":2,"toRight":1,"map":[],"width":70,"height":37},{"id":58,"title":"dfdsfdsf","posX":611.5,"posY":630,"style":2,"toRight":0,"map":[],"width":97,"height":37}],"width":205,"height":37}]}';

        try {
            $this->json = json_decode($st, true);
        } catch (Exception $exc) {
            die('0');
        }

        $this->landscape = filter_input(INPUT_POST, 'landscape', FILTER_VALIDATE_BOOLEAN);
        $pageSize = filter_input(INPUT_POST, 'pagesize');


        if ($pageSize === "A3") {
            $this->pageSize = 'A3';
            if ($this->landscape === true) {
                $this->pW = $this->a3h;
                $this->pH = $this->a3w;
            } else {
                $this->pW = $this->a3w;
                $this->pH = $this->a3h;
            }
        } else {
            $this->pageSize = 'A4';
            if ($this->landscape === true) {
                $this->pW = $this->a4dpi300h;
                $this->pH = $this->a4dpi300w;
            } else {
                $this->pW = $this->a4dpi300w;
                $this->pH = $this->a4dpi300h;
            }
        }
        $this->width = round(filter_input(INPUT_POST, 'width', FILTER_VALIDATE_INT));
        $this->height = round(filter_input(INPUT_POST, 'height', FILTER_VALIDATE_INT));

        //$this->width = 1920;
        //$this->height = 891;

        $this->img = imagecreatetruecolor($this->width, $this->height);
        $this->white = imagecolorallocate($this->img, 255, 255, 255);
        $this->black = imagecolorallocate($this->img, 0, 0, 0);

        imagefilledrectangle($this->img, 0, 0, $this->width, $this->height, $this->white);

        $this->col1 = imagecolorallocate($this->img, 0, 137, 197);
        $this->col2 = imagecolorallocate($this->img, 202, 127, 27);
    }

    public function generatePrint() {
        $this->drawImage($this->json['map']);

        if ($this->onlyImg) {

            //header('Content-Type: image/jpeg');
            header("Content-Type: application/octet-stream");
            header("Content-Disposition: attachment; filename=image.jpg");

            $newheight = 0;

            if ($this->imgW == 0) {
                imagejpeg($this->img);
                imagedestroy($this->img);
                die();
            } else {
                
                if($this->imgW > $this->width) {
                    $newheight = $this->height;
                    $this->imgW = $this->width;
                } else {
                    $pro = ($this->imgW * 100) / $this->width;
                    $newheight = round(($this->height *$pro) / 100);
                    //$newheight = $this->height*1 - $newheight*1;
                }
                
                //echo $this->height.'----'.$newheight.'###';
                
                $thumb = imagecreatetruecolor($this->imgW, $newheight);

                imagecopyresized($thumb, $this->img, 0, 0, 0, 0, $this->imgW, $newheight, $this->width, $this->height);

                imagejpeg($thumb);
                imagedestroy($thumb);

                die();
            }
        }

        $pageL = explode('.', ($this->width / $this->pW));
        $pageD = explode('.', ($this->height / $this->pH));
        
        if(isset($pageD[1])) {
            $pageD = $pageD[0] + 1;
        } else {
            $pageD = $pageD[0];
        }
        
        if(isset($pageL[1])) {
            $pageL = $pageL[0] + 1;
        } else {
            $pageL = $pageL[0];
        }
        
        $leftX = $this->width + $this->pW;
        $leftY = $this->height + $this->pH;
        
        $pageL--;
        $pageD--;

        $i = 0;
        $j = 0;
        $startx = 0;
        $starty = 0;
        while ($i++ <= $pageD) {
            $leftY = $leftY - $this->pH;
            while ($j++ <= $pageL) {
                $leftX = $leftX - $this->pW;
                $img = imagecreatetruecolor($this->pW, $this->pH);
                imagefilledrectangle($img, 0, 0, $this->pW, $this->pH, $this->white);
                $w = $this->pW;
                $h = $this->pH;

                if ($leftX <= $this->pW) {
                    $w = $leftX;
                }

                if ($leftY <= $this->pH) {
                    $h = $leftY;
                }

                imagecopy($img, $this->img, 0, 0, $startx, $starty, $w, $h);

                ob_start();
                imagejpeg($img);
                $image_data = ob_get_contents();
                $image_data = substr_replace($image_data, pack("cnn", 1, 300, 300), 13, 5);
                ob_end_clean();


                $image_data = base64_encode($image_data);
                
                echo '<img src="data:image/jpeg;base64,' . $image_data . '" style="page-break-after:always;" alt="" /><br />';
                $startx = $startx + $this->pW;
            }
            $j = 0;
            $starty = $starty + $this->pH;
            $startx = 0;
            $leftX = $this->width + $this->pW;
            
        }
    }

    private function drawImage($map, $parent = 0, $level = 0) {

        $len = count($map);
        $i = -1;

        if ($level === 0) {
            $this->minYl = array();
            $this->minYr = array();
        }

        $len--;

        while ($i++ < $len) {
            if ($map[$i]['toRight'] === 1) {

                $width = $map[$i]['width'];
                $height = $map[$i]['height'];
                $x = $map[$i]['posX'];
                $y = $map[$i]['posY'];

                if ($map[$i]['id'] === 0) {
                    $this->parentX = $x;
                    $this->parentY = $y + $height / 2;
                }
                $this->drawNode($x, $y, $width, $height, $map[$i]['style'] === 1 ? $this->col1 : $this->col2, $map[$i]['title']);
                $this->drawImage($map[$i]['map'], json_decode('{"x": ' . ($x + $width) . ', "y": ' . ($y + ($height / 2)) . ', "style": ' . $map[$i]['style'] . ', "id": ' . $map[$i]['id'] . '}', true), ($level + 1));

                if ($parent !== 0) {
                    $this->drawLine($parent['x'], $parent['y'], $x, $y + ($height / 2), $parent['style'] === 1 ? $this->col1 : $this->col2);
                }
            }
        }

        $i = -1;
        if ($parent !== 0 && $parent['id'] === 0) {

            $parent['x'] = $this->parentX;
            $parent['minX'] = $parent['x'] - 30;
            $parent['y'] = $this->parentY;
        }
        while ($i++ < $len) {
            if ($map[$i]['toRight'] === 0) {

                $width = $map[$i]['width'];
                $height = $map[$i]['height'];
                $x = $map[$i]['posX'];
                $y = $map[$i]['posY'];

                $this->drawImage($map[$i]['map'], json_decode('{"x": ' . $x . ', "y": ' . ($y + ($height / 2)) . ', "style": ' . $map[$i]['style'] . ', "id": ' . $map[$i]['id'] . '}', true), ($level + 1));
                $this->drawNode($x, $y, $width, $height, $map[$i]['style'] === 1 ? $this->col1 : $this->col2, $map[$i]['title']);

                if ($parent !== 0) {
                    $this->drawLine($parent['x'], $parent['y'], $x + $width, $y + ($height / 2), $parent['style'] === 1 ? $this->col1 : $this->col2);
                }
            }
        }
    }

    private function drawNode($x, $y, $w, $h, $col, $text) {

        $cx = $x + $w;
        $cy = $y + $h;
        $dia = $this->rad * 2;
        $text = wordwrap($text, 34, "\n", true);
        $lines = explode("\n", $text);
        $total = count($lines);

        if ($total > 1) {
            $cy = $cy + ($total * (5)) - (11) + 10;
        }

        imagefilledrectangle($this->img, $x, $y, $cx, $cy, $col);
        imagefilledrectangle($this->img, $x + 1, $y + 1, $cx - 1, $cy - 1, $this->white);

        // Now rounded corners
        imagefilledellipse($this->img, $x + $this->rad - 2, $y + $this->rad - 2, $this->rad * 2, $dia, $this->white);
        imagefilledellipse($this->img, $x + $this->rad, $y + $this->rad, $this->rad * 2, $dia, $col);
        imagefilledellipse($this->img, $x + $this->rad + 1, $y + $this->rad + 1, $this->rad * 2, $dia, $this->white);
        imagefilledellipse($this->img, $x + $this->rad + 3, $y + $this->rad + 1, $this->rad * 2, $dia, $this->white);
        imagefilledellipse($this->img, $x + $this->rad + 1, $y + $this->rad + 3, $this->rad * 2, $dia, $this->white);

        imagefilledellipse($this->img, $x + $this->rad - 2, $cy - $this->rad + 2, $this->rad * 2, $dia, $this->white);
        imagefilledellipse($this->img, $x + $this->rad, $cy - $this->rad, $this->rad * 2, $dia, $col);
        imagefilledellipse($this->img, $x + $this->rad + 1, $cy - $this->rad - 1, $this->rad * 2, $dia, $this->white);
        imagefilledellipse($this->img, $x + $this->rad + 3, $cy - $this->rad - 1, $this->rad * 2, $dia, $this->white);
        imagefilledellipse($this->img, $x + $this->rad + 1, $cy - $this->rad - 3, $this->rad * 2, $dia, $this->white);

        imagefilledellipse($this->img, $cx - $this->rad + 2, $cy - $this->rad + 2, $this->rad * 2, $dia, $this->white);
        imagefilledellipse($this->img, $cx - $this->rad, $cy - $this->rad, $this->rad * 2, $dia, $col);
        imagefilledellipse($this->img, $cx - $this->rad - 1, $cy - $this->rad - 1, $this->rad * 2, $dia, $this->white);
        imagefilledellipse($this->img, $cx - $this->rad - 3, $cy - $this->rad - 1, $this->rad * 2, $dia, $this->white);
        imagefilledellipse($this->img, $cx - $this->rad - 1, $cy - $this->rad - 3, $this->rad * 2, $dia, $this->white);

        imagefilledellipse($this->img, $cx - $this->rad + 2, $y + $this->rad - 2, $this->rad * 2, $dia, $this->white);
        imagefilledellipse($this->img, $cx - $this->rad, $y + $this->rad, $this->rad * 2, $dia, $col);
        imagefilledellipse($this->img, $cx - $this->rad - 1, $y + $this->rad + 1, $this->rad * 2, $dia, $this->white);
        imagefilledellipse($this->img, $cx - $this->rad - 3, $y + $this->rad + 1, $this->rad * 2, $dia, $this->white);
        imagefilledellipse($this->img, $cx - $this->rad - 1, $y + $this->rad + 3, $this->rad * 2, $dia, $this->white);

        $y = $y + 8;

        $co = count($lines);
        $co--;
        $i = -1;

        while ($i++ < $co) {
            //ImageString($this->img, 12, $x + 12, $y, $lines[$i], $this->black);
            imagettftext($this->img, 11, 0, $x + 12, $y + 15, $this->black, $this->font, $lines[$i]);
            $y = $y + 9 + 11;
        }
    }

    private function drawLine($x1, $y1, $x2, $y2, $color) {
        imageline($this->img, $x1, $y1, $x2, $y2, $color);
    }

}

<?php
// Check if form is submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $inputText = $_POST['unicodebox'];

    $convertedText = strtoupper($inputText);  // Just an example for now 

    echo "<h2>Converted Text:</h2>";
    echo "<p>$convertedText</p>";
    echo "<a href='index.php'>Back</a>";
}
?>

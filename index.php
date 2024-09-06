<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nepali Unicode Converter</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Nepali Unicode Converter</h1>

        <!-- Mode Selector -->
        <div class="mode_selector">
            <label for="mode">Choose Conversion Mode:</label>
            <select id="mode" onchange="changeMode()">
                <option value="roman_to_unicode">Romanized to Nepali Unicode</option>
                <option value="unicode_to_preeti">Nepali Unicode to Preeti</option>
                <option value="preeti_to_unicode">Preeti to Nepali Unicode</option>
            </select>
        </div>

        <!-- Conversion Form -->
        <form id="conversionForm" method="POST" action="process.php">
            <div id="iframe-1"></div>

            <div class="button-group">
                <button class="convert-button" type="submit">Convert</button>
                <button class="clear-button" type="button" onclick="clearContent()">Clear</button>
            </div>
        </form>
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", function () {
            changeMode(); // Initialize the default mode
        });

        // Function to change conversion mode
        function changeMode() {
            var mode = document.getElementById("mode").value;
            var contentContainer = document.getElementById("iframe-1");
            contentContainer.innerHTML = ""; // Clear previous content

            var htmlContent = '';

            if (mode === "roman_to_unicode") {
                htmlContent = `
                    <textarea class="textarea_unicode" id="unicode_text_two" name="unicodebox" placeholder="Type or paste Romanized text"></textarea>
                `;
            } else if (mode === "unicode_to_preeti") {
                htmlContent = `
                    <textarea class="textarea_unicode" id="unicode_text_two" name="unicodebox" placeholder="Type or paste Nepali Unicode text"></textarea>
                `;
            } else if (mode === "preeti_to_unicode") {
                htmlContent = `
                    <textarea class="textarea_unicode" id="unicode_text_two" name="unicodebox" placeholder="Type or paste Preeti text"></textarea>
                `;
            }

            contentContainer.innerHTML = htmlContent;
        }

        // Function to clear content
        function clearContent() {
            document.getElementById("unicode_text_two").value = '';
        }
    </script>
</body>
</html>

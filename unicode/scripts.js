function convert_to_Preeti()
{var array_one=new Array("â€˜","?","à¤•à¤¼","à¤–à¤¼","à¤—à¤¼","à¤œà¤¼","à¤¡à¤¼","à¤¢à¤¼","à¤«à¤¼","à¥","à¤½","à¥¤","m'","m]","mfF","mF","à¥¦","à¥§","à¥¨","à¥©","à¥ª","à¥«","à¥¬","à¥­","à¥®","à¥¯","à¤«à¥à¤°","à¤","à¤«","à¤•à¥à¤¤","à¤•à¥à¤°","à¤²","à¤œà¥à¤žà¥","à¤¦à¥à¤˜","à¤œà¥à¤ž","à¤¦à¥à¤¦","à¤¦à¥à¤§","à¤¶à¥à¤°","à¤°à¥","à¤¦à¥à¤¯","à¤•à¥à¤·à¥","à¤•à¥à¤·","à¤¤à¥à¤¤","à¤¦à¥à¤®","à¤¤à¥à¤°","à¤§à¥à¤°","à¤™à¥à¤˜","à¤¡à¥à¤¡","à¤¦à¥à¤°","à¤Ÿà¥à¤Ÿ","à¤¡à¥à¤¢","à¤ à¥à¤ ","à¤°à¥‚","à¤¹à¥ƒ","à¤™à¥à¤—","à¤¤à¥à¤°","à¤™à¥à¤•","à¤™à¥à¤–","à¤Ÿà¥à¤ ","à¤¦à¥à¤µ","à¤Ÿà¥à¤°","à¤ à¥à¤°","à¤¡à¥à¤°","à¤¢à¥à¤°","à¥à¤°","à¤¡à¤¼","à¤¢à¤¼","à¤•à¥","à¤•","à¤–à¥","à¤–","à¤—à¥","à¤—","à¤˜à¥","à¤˜","à¤™","à¤šà¥","à¤š","à¤›","à¤œà¥","à¤œ","à¤à¥","à¤","à¤žà¥","à¤ž","à¤Ÿ","à¤ ","à¤¡","à¤¢","à¤£à¥","à¤£","à¤¤à¥","à¤¤","à¤¥à¥","à¤¥","à¤¦","à¤§à¥","à¤§","à¤¨à¥","à¤¨","à¤ªà¥","à¤ª","à¤«à¥","à¤¬à¥","à¤¬","à¤­à¥","à¤­","à¤®à¥","à¤®","à¤¯","à¤°","à¤²à¥","à¤²","à¤µà¥","à¤µ","à¤¶à¥","à¤¶","à¤·à¥","à¤·","à¤¸à¥","à¤¸","à¤¹à¥","à¤¹","à¥à¤¯","à¤‘","à¤‘","à¤”","à¤“","à¤†","à¤…","à¤ˆ","à¤‡","à¤Š","à¤‰","à¤‹","à¤","à¤","à¥‰","à¥‚","à¥","à¤‚","à¤¾","à¥ƒ","à¥","à¥‡","à¥ˆ","à¤","à¥€","à¤ƒ","à¥‹","à¥Œ")
var array_two=new Array("â€¦","<","à¤•à¤¼","à¤–à¤¼","à¤—à¤¼","à¤œà¤¼","à¤¡à¤¼","à¤¢à¤¼","à¤«à¤¼","Ã§","Ëœ",".","'m","]m","Fmf","Fm",")","!","@","#","$","%","^","&","*","(","k|m","em","km","Qm","qm","n","Â¡","Â¢","1","2","4",">","?","B","I","If","Q","ÃŸ","q","â€ž","â€¹","â€¢","â€º","Â§","Â°","Â¶","Â¿","Ã…","Ã‹","ÃŒ","Ã","ÃŽ","Ã","Ã¥","6Â«","7Â«","8Â«","9Â«","|","8Ãž","9Ãž","S","s","V","v","U","u","Â£","3","Âª","R","r","5","H","h","â€°","Â´","~","`","6","7","8","9","0","0f","T","t","Y","y","b","W","w","G","g","K","k","Ë†","A","a","E","e","D","d","o","/","N","n","J","j","Z","z","i","if",":",";","X","x","Ã˜","cfâ€˜","câ€˜f","cf}","cf]","cf","c","O{","O","pm","p","C","P]","P","fâ€˜","\"","'","+","f","[","\\","]","}","F","L","M","f]","f}")
var array_one_length=array_one.length;var modified_substring=document.getElementById("unicode_text_two").value;Replace_Symbols();processed_text=modified_substring;document.getElementById("legacy_text_two").value=processed_text;function Replace_Symbols()
{if(modified_substring!="")
{var position_of_f=modified_substring.indexOf("à¤¿");while(position_of_f!=-1)
{var character_left_to_f=modified_substring.charAt(position_of_f-1);modified_substring=modified_substring.replace(character_left_to_f+"à¤¿","l"+character_left_to_f);position_of_f=position_of_f-1;while((modified_substring.charAt(position_of_f-1)=="à¥")&(position_of_f!=0))
{var string_to_be_replaced=modified_substring.charAt(position_of_f-2)+"à¥";modified_substring=modified_substring.replace(string_to_be_replaced+"l","l"+string_to_be_replaced);position_of_f=position_of_f-2;}
position_of_f=modified_substring.search(/à¤¿/,position_of_f+1);}
set_of_matras="à¤¾à¤¿à¥€à¥à¥‚à¥ƒà¥‡à¥ˆà¥‹à¥Œà¤‚:à¤à¥…"
modified_substring+='  ';var space=" "
var position_of_half_R=modified_substring.indexOf("à¤°à¥");while(position_of_half_R>0)
{var probable_position_of_Z=position_of_half_R+2;var character_at_probable_position_of_Z=modified_substring.charAt(probable_position_of_Z)
while(set_of_matras.match(character_at_probable_position_of_Z)!=null)
{probable_position_of_Z=probable_position_of_Z+1;character_at_probable_position_of_Z=modified_substring.charAt(probable_position_of_Z);}
var right_to_position_of_Z=probable_position_of_Z+1;if(right_to_position_of_Z>0)
{var character_right_to_position_of_Z=modified_substring.charAt(right_to_position_of_Z)
while("à¥".match(character_right_to_position_of_Z)!=null)
{probable_position_of_Z=right_to_position_of_Z+1;character_at_probable_position_of_Z=modified_substring.charAt(probable_position_of_Z);right_to_position_of_Z=probable_position_of_Z+1;character_right_to_position_of_Z=modified_substring.charAt(right_to_position_of_Z)}}
string_to_be_replaced=modified_substring.substr(position_of_half_R+2,(probable_position_of_Z-position_of_half_R)-1);modified_substring=modified_substring.replace("à¤°à¥"+string_to_be_replaced,string_to_be_replaced+"{");position_of_half_R=modified_substring.indexOf("à¤°à¥");}
modified_substring=modified_substring.substr(0,modified_substring.length-2);for(input_symbol_idx=0;input_symbol_idx<array_one_length;input_symbol_idx++)
{idx=0;while(idx!=-1)
{modified_substring=modified_substring.replace(array_one[input_symbol_idx],array_two[input_symbol_idx])
idx=modified_substring.indexOf(array_one[input_symbol_idx])}}}}}

function clearContent()
{
    document.getElementById("unicode_text_two").value='';
	document.getElementById("legacy_text_two").value='';
}



        function copyPreeti(event) {
            var copyText = document.getElementById("legacy_text_two");
            doCopying(copyText,event);
            
        }
        function doCopying(copyText,event){
            copyText.select();
            copyText.setSelectionRange(0, 99999);
            document.execCommand("copy");

            //debugger;
            event.target.innerHTML="Copied &#10003;"
            setTimeout(function(){
                event.target.innerHTML="Copy";
            },3000);
        }
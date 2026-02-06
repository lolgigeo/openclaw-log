---
title: 搜索
date: 2026-02-06 15:30:00
type: "search"
comments: false
---

<div id="search-result">
  <div id="no-result">
    <i class="fa fa-search"></i>
    <p>输入关键词搜索文档</p>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/hexo-generator-search@2.4.3/dist/search.min.js"></script>
<script>
var searchFunc = function(path, search_id, content_id) {
    'use strict';
    $.ajax({
        url: path,
        dataType: "xml",
        success: function( xmlResponse ) {
            var datas = $( "entry", xmlResponse ).map(function() {
                return {
                    title: $( "title", this ).text(),
                    content: $("content",this).text(),
                    url: $( "url" , this).text()
                };
            }).get();
            
            var $input = document.getElementById(search_id);
            var $resultContent = document.getElementById(content_id);
            
            if (!$input) {
                var searchBox = '<div class="search-box">' +
                    '<input type="text" id="' + search_id + '" placeholder="搜索文档..." />' +
                    '</div>';
                $('#search-result').prepend(searchBox);
                $input = document.getElementById(search_id);
            }
            
            $input.addEventListener('input', function(){
                var str = '<ul class=\"search-result-list\">';
                var keywords = this.value.trim().toLowerCase().split(/[\s\-]+/);
                $resultContent.innerHTML = "";
                
                if (this.value.trim().length <= 0) {
                    $('#no-result').show();
                    return;
                }
                
                $('#no-result').hide();
                
                datas.forEach(function(data) {
                    var isMatch = true;
                    var content_index = [];
                    var data_title = data.title.trim().toLowerCase();
                    var data_content = data.content.trim().replace(/<[^>]+>/g,"").toLowerCase();
                    var data_url = data.url;
                    var index_title = -1;
                    var index_content = -1;
                    var first_occur = -1;
                    
                    if(data_title != '' && data_content != '') {
                        keywords.forEach(function(keyword, i) {
                            index_title = data_title.indexOf(keyword);
                            index_content = data_content.indexOf(keyword);
                            if( index_title < 0 && index_content < 0 ){
                                isMatch = false;
                            } else {
                                if (index_content < 0) {
                                    index_content = 0;
                                }
                                if (i == 0) {
                                    first_occur = index_content;
                                }
                            }
                        });
                    }
                    
                    if (isMatch) {
                        str += "<li><a href='"+ data_url +"' class='search-result-title'>"+ data.title +"</a>";
                        var content = data.content.trim().replace(/<[^>]+>/g,"");
                        if (first_occur >= 0) {
                            var start = first_occur - 20;
                            var end = first_occur + 80;
                            if(start < 0){
                                start = 0;
                            }
                            if(start == 0){
                                end = 100;
                            }
                            if(end > content.length){
                                end = content.length;
                            }
                            var match_content = content.substr(start, end);
                            keywords.forEach(function(keyword){
                                var regS = new RegExp(keyword, "gi");
                                match_content = match_content.replace(regS, "<em class=\"search-keyword\">"+keyword+"</em>");
                            });
                            
                            str += "<p class=\"search-result-abstract\">" + match_content + "...</p>"
                        }
                        str += "</li>";
                    }
                });
                str += "</ul>";
                $resultContent.innerHTML = str;
            });
        }
    });
};

$(document).ready(function() {
    searchFunc('/search.xml', 'local-search-input', 'search-result');
});
</script>

<style>
.search-box {
    margin: 20px 0;
}
.search-box input {
    width: 100%;
    padding: 12px 20px;
    font-size: 16px;
    border: 2px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
    transition: border-color 0.3s;
}
.search-box input:focus {
    border-color: #0e83cd;
    outline: none;
}
#no-result {
    text-align: center;
    color: #999;
    padding: 40px 0;
}
#no-result i {
    font-size: 48px;
    display: block;
    margin-bottom: 20px;
}
.search-result-list {
    list-style: none;
    padding: 0;
}
.search-result-list li {
    margin: 20px 0;
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 4px;
    transition: box-shadow 0.3s;
}
.search-result-list li:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.search-result-title {
    font-size: 18px;
    font-weight: bold;
    color: #0e83cd;
    text-decoration: none;
}
.search-result-title:hover {
    color: #0a5a8a;
}
.search-result-abstract {
    margin-top: 8px;
    color: #666;
    line-height: 1.6;
}
.search-keyword {
    color: #d9534f;
    font-weight: bold;
    font-style: normal;
}
</style>

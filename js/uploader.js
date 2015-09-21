var $ = $ || {};

$(function(){
    /**
     * Implementation borrowed from:
     * http://www.html5rocks.com/en/tutorials/file/dndfiles/
     */
    $("#upload-area").on("dragover", function (e) {        
        e.stopPropagation();
        e.preventDefault();

        e.originalEvent.dataTransfer.dropEffect = "copy";
    }).on("drop", function (e){        
        e.stopPropagation();
        e.preventDefault();

        var files = e.originalEvent.dataTransfer.files;

        parse_data(files);
    }).on("click", function(e) {        
        $("#data-file").trigger("click");        
    }).hover(function(e) {        
        $(this).css("cursor", "pointer");        
    });


    $("#data-file").change(function(e) {
        var files = e.originalEvent.target.files;

        parse_data(files);
    });

    function parse_data (files) {
        
        var filename;
        
        console.log("uplading files");

        for (var i in files)
        {
            if (!files.hasOwnProperty(i)) {
                continue;
            }

            /**
             * @ToDo Check must be added here to see if *name* attribute exists
             * on the File object as it is likely named differently in different
             * browsers.
             */
            filename = files[i].name;
            
            var input_el = document.createElement("input");
            input_el.name = "data_file";
            input_el.value = filename;
            input_el.type= "radio";

            var label = document.createElement("label");
            label.appendChild(input_el);
            label.appendChild(document.createTextNode(filename));
            
            
            var div_container = document.createElement("div");
            div_container.className = "radio";
            div_container.appendChild(label);
            
            $("#local-event-files-list-container").append(div_container);
            document.app_config.local_data_files[filename] = files[i];
            
        }

        console.log(document.app_config.local_data_files);
    }

});


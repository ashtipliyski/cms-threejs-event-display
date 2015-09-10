var $ = $ || {};

$(function(){
    document.get_event_files = function ()
    {
        var events_folder = "events";
        var event_files = [];
        
        $.ajax(
            events_folder,
            {
                dataType: "html",
                success: function (data) {
                    var parsed_html = $.parseHTML(data);

                    var files_table = parsed_html[9];
                    var file_trs = files_table.children[0].children;

                    for (var i in file_trs)
                    {
                        if (i != 0 && file_trs.hasOwnProperty(i)) {
                            var a_str = file_trs[i].children[2].innerHTML;

                            var el_flags = file_trs[i].children[0].children[0]; 
                            var el_type = el_flags.innerHTML.substr(1, 1);

                            if (el_type == '-') {
                                
                                var result = a_str.match(/href="([^"]*")/g)[0];
                                var file = result.substring(
                                    6, result.length - 1
                                );

                                var extension = result.substr(
                                    result.length - 3,
                                    2
                                );

                                if (extension === "js") {
                                    event_files.push(file);
                                }
                                
                            }
                        }
                    }

                    document.generate_event_files_list(event_files);
                },
                fail: function (data) {
                    console.log("failure loading event files");
                }
            }
        );
    };


    document.generate_event_files_list = function (event_files)
    {
        for (var i in event_files)
        {
            var input_el = document.createElement("input");
            input_el.name = "data_file";
            input_el.value = event_files[i];
            input_el.type= "radio";

            var label = document.createElement("label");
            label.appendChild(input_el);
            label.appendChild(document.createTextNode(event_files[i]));
            
            
            var div_container = document.createElement("div");
            div_container.className = "radio";
            div_container.appendChild(label);

            console.dir(label);
            
            $("#event-files-list-container").append(div_container);
        }
    };
    
    document.get_event_files();
});


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

                    var links_list = data.match(
                            /<a href="([/a-z_0-9\-]+\.js)">[a-z_0-9\-]+\.js<\/a>/g
                    );

                    for (var i in links_list)
                    {           
                        var result = links_list[i].match(/href="([^"]*")/g)[0];
                        var file = result.substring(
                            6, result.length - 1
                        );

                        var extension = result.substr(
                            result.length - 3,
                            2
                        );

                        if (!file.indexOf("\\")) {
                            file = "events\\" + file;
                        }

                        if (extension === "js") {
                            event_files.push(file);
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


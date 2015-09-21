var $ = $ || {};

$(function(){

    $("#control-tabs a:last").tab("show");
    // $('#candidates-table').fixedHeaderTable(
    // {footer:true, cloneHeadtoFoot:true, fixedColumn:false}
    //);

    var sorter_function = function (node)
    {
        return node.childNodes[0].innerHTML;
    };

    document.attach_table_events = function (scene, render)
    {
        // .hover( handlerIn, handlerOut )
        $("#candidates-table tbody tr").hover(function (e){
            // handlerIn

            var cand_id = parseInt($(this).find("td.id-cell small").html()) - 1;
            var cand = document.event.candidates[cand_id];

            document.highlight_candidate(cand, scene, render);
        }, function (e) {
            // handlerOut

            var cand_id = parseInt($(this).find("td.id-cell small").html()) - 1;
            var cand = document.event.candidates[cand_id];
            
            document.reset_candidate(cand, scene, render);
        });

        $('#candidates-table tbody input[type="checkbox"]').click(function(e) {
            //return;
            //e.preventDefault();
            e.stopPropagation();

            var id_str = $(this).parent().parent().find("td.id-cell small").
                    html();
            var cand_id = parseInt(id_str) - 1;


            
            if ($('#box-' + cand_id).prop('checked')) {
                document.showTrack(cand_id);
            } else {
                document.hideTrack(cand_id);
            }
            

        });

        $("#candidates-table tbody tr").click(function(e){
            
            //e.stopPropagation();
            //e.preventDefault();
//          console.log($(this).find("td input[type='checkbox']")[0].checked);
            // var checkbox_obj = $(this).find("td input[type='checkbox']");
            
            
            var cand_id = parseInt($(this).find("td.id-cell small").html()) - 1;
            var cand = document.event.candidates[cand_id];

            /*
            if ($(this) != $(this).find("td input[type='checkbox']")) {
                if ($(this).find("td input[type='checkbox']").prop("checked")) {
                    $(this).find("td input[type='checkbox']").prop("checked", false);
                    $(this).find("span.hidden").html("0");
                    // console.log("disabling");
                } else {
                    $(this).find("td input[type='checkbox']").prop("checked", true);
                    $(this).find("span.hidden").html("1");
                    // console.log("enabling");
                }
            } */

            
            // console.log($(this).find("td input")[0]);
            
            document.select_candidate(cand, scene, render);
            document.showTrack(cand_id);
        });

        // configure tablesorter bootstrap theme

    
        $("#candidates-table").tablesorter({
            textExtraction: sorter_function,
            theme:'default',
            widthFixed: false,
            headerTemplate:'{content}{icon}',
            widgets: ['stickyHeaders'],
            widgetOptions: {
                stickyHeaders_attachTo: '#cand-table-container'
            }
        });

        /*
        // add a single row to the data 
        $('#candidates-table-sticky')
         */
        
        // this should be moved to a place where it is called only once after
        // all candidates are loaded not after every single candidate
        $('[data-toggle="tooltip"]').tooltip({container:'body'});
    };

    document.add_candidate = function (cand)
    {
        /**
         * Taken from: ttp://stackoverflow.com/questions/5361810/fast-way-to-dynamically-fill-table-with-data-from-json-in-javascript
         */

        var r = new Array(), j = -1;
        //for (var key=0, size=data.length; key<size; key++){


        var class_name = '';

        if (!cand.data.tp_obj_coords) {
            class_name += ' danger';
        }
        /*
         <button type="button" class="btn btn-default" data-toggle="tooltip" 
         data-placement="left" title="Tooltip on left">Tooltip on left</button>
         */

        var tooltip_str = '';

        if (cand.data.tp_data.hasOwnProperty("pt")) {
            
            tooltip_str += 'True particle: \n';
            tooltip_str += 'pt = ' + cand.data.tp_data.pt.toFixed(2) +
                ' GeV/c; ';
            tooltip_str += 'q = ' + cand.data.tp_data.q.toFixed(0) + 'e; ';
            tooltip_str += 'eta = ' + cand.data.tp_data.eta.toFixed(2) + '; ';
            tooltip_str += 'phi0 = ' + cand.data.tp_data.phi0.toFixed(2) + '; ';
            tooltip_str += 'm = '+ cand.data.tp_data.m.toFixed(2) +
                ' GeV/c^2 ; ';
        }
        
        r[++j] = '<tr id="el-' + cand.data.id + '" class="' + class_name +
            '" data-toggle="tooltip" data-placement="left" title="' +
            tooltip_str + '">';
        r[++j] = '<td scope="row"><small class="hidden">1</small>' +
            '<input id="box-' + cand.data.id +
            '" type="checkbox" checked="checked"></td>';
        r[++j] = '<td class="int id-cell"><small>';
        r[++j] = parseInt(cand.data.id) + 1;
        r[++j] = '</small></td><td class="fl" title="' +
            cand.data.pt.toFixed(5) + '"><small>';
        r[++j] = cand.data.pt.toFixed(2);
        r[++j] = '</small></td><td class="int"><small>';
        r[++j] = cand.data.q.toFixed(0);
        r[++j] = '</small></td><td class="fl" title="' +
            cand.data.eta.toFixed(5) + '"><small>';
        r[++j] = cand.data.eta.toFixed(2);
        r[++j] = '</small></td><td class="fl" title="' +
            cand.data.phi0.toFixed(5) + '"><small>';
        r[++j] = cand.data.phi0.toFixed(2);
        r[++j] = '</small></td><td class="fl"><small>';
        r[++j] = cand.data.sphi.toFixed(0);
        r[++j] = '</small></td><td class="fl"><small>';
        r[++j] = cand.data.reta.toFixed(0);
        r[++j] = '</small></td>';
        r[++j] = '</small></td></tr>';
        
        $('#candidates-table tbody').append(r.join(''));        
    };
    
    document.highlight_candidate = function (cand, scene, render)
    {
        if (document.prev_click_target == cand) {
            return;
        }
        
        document.prev_hover_target = cand;
        cand.highlight();

        $("#focus-panel .panel-body #highlighted-tr").html(
            "Track " + cand.get_info_text()
        );
        
        render();
    };
    
    document.select_candidate = function (cand, scene, render)
    {
        if (document.prev_click_target)
        {
            document.reset_click_candidate(
                document.prev_click_target, scene, render
            );
        }

        document.prev_click_target = cand;

        cand.show_info();
        cand.select();

        document.prev_hover_target = null;

        $("#candidates-table tr#el-" + cand.data.id).addClass("info");
        $("#focus-panel .panel-body #selected-tr").html(
            "Track " + cand.get_info_text()
        );

        render();
    };

    document.reset_click_candidate = function (cand, scene, render)
    {
        cand.hide_info();
        cand.restore();
        
        $("#candidates-table tr#el-" + cand.data.id).removeClass("info");
        
        $("#focus-panel .panel-body #selected-tr").html("&nbsp;");

        render();
    };
    
    document.reset_candidate = function (cand, scene, render)
    {
        if (cand == document.prev_click_target) {
            return;
        }

        cand.restore();
        cand.hide_info();

        $("#focus-panel .panel-body #highlighted-tr").html("-- no focus --");

        render();
    };


    // control elements event handlers

    $('#data-tabs a').click(function(e) {
        e.preventDefault();
        $(this).tab('show');

        document.app_config.data_source = $(this).attr("aria-controls");
    });


    $("#load-data-btn").click(function(e){
        if (document.app_config.data_source == 'local') {

            if ($("#local-event-files-list-container input:checked").length == 0) {
                return;
            }
            
            var selected_file =
                    $("#local-event-files-list-container input:checked").val();
            var file = document.app_config.local_data_files[selected_file];
            var reader = new FileReader();
            reader.onload = (function(f_ref){
                return function (e) {
                    var str_data = reader.result;
                    var json_str = str_data.substr(20, str_data.length - 22);

                    var external_data = $.parseJSON(json_str);
                    document.external_data = external_data;
                    document.visualiseEvent(external_data.candidates);
                };
            })(file);

            reader.readAsText(file);

        } else {
            document.loadData();
        }

        $('#data-man-dialog').modal('hide');
    });
});

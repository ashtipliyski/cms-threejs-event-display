/**
 * @TODO: Make the UI automatically re-adjust to window resize events
 * 
 */
var $ = $ || {};

$(function() {

    document.app_config = {
        "data_source": "local",
        "local_data_files": []
    };    

    var scene, camera, renderer, container;

    // inset scene elements
    var scene_i, camera_i, renderer_i, container_i;

    // inset constants
    var CANVAS_WIDTH = 100,
        CANVAS_HEIGHT = 100,
        CAM_DISTANCE = 300;
    
    var geometry, material, mesh, plane;

    //var scene_width = 700;
    //var scene_height = 500;
    var scene_width = window.innerWidth - 5;
    var scene_height = window.innerHeight - 5;

    var mouse;
    
    init();
    animate();

    function init()
    {
        container = document.getElementById("canvas-container");
        container_i = document.getElementById('inset');
        
        scene = new THREE.Scene();

        camera = new THREE.CombinedCamera(
            scene_width/2, scene_height/2, 45, 0.0001, 10000, -500, 1000
        );
        camera.position.set(0, 0 ,1000);

        var line_geometry = new THREE.Geometry();
        
        line_geometry.vertices.push(new THREE.Vector3(0,0,-800));
        line_geometry.vertices.push(new THREE.Vector3(0,0,800));
        
        var line_material = new THREE.LineBasicMaterial({
            color:0x888888, linewidth: 5
        });
        var beam_line = new THREE.Line(line_geometry, line_material);

        
        // add assets to scene
        scene.add(beam_line);

        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0xffffff);
        renderer.setSize(scene_width, scene_height);
        
        // container.addEventListener('mousedown', onSceneMouseDown, false);
        // container.addEventListener('mousemove', onSceneMouseMove, false);

        window.addEventListener('resize', onWindowResize, false);
        
        controls = new THREE.TrackballControls(camera, container);

        controls.rotateSpeed = 4.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.5;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = true;
        controls.keys = [ 65, 83, 68 ];
        
        controls.addEventListener( 'change', render );

        container.appendChild(renderer.domElement);

        // inset elements        
        renderer_i = new THREE.WebGLRenderer({
            alpha: true
        });
        renderer_i.setClearColor( 0xf0f0f0, 0);
        renderer_i.setSize( CANVAS_WIDTH, CANVAS_HEIGHT );
        container_i.appendChild( renderer_i.domElement );

        // scene
        scene_i = new THREE.Scene();

        // camera
        camera_i = new THREE.PerspectiveCamera(
            50, CANVAS_WIDTH / CANVAS_HEIGHT, 1, 1000
        );
        camera_i.up = camera.up; // important!

        // define axes using Arrow Helpers for each direction
        var i_origin = new THREE.Vector3(0,0,0);
        
        var rx = new THREE.ArrowHelper(
            new THREE.Vector3(4,0,0), i_origin, 120, 0xff0000, 40, 25
        );
        var gy = new THREE.ArrowHelper(
            new THREE.Vector3(0,4,0), i_origin, 120, 0x00ff00, 40, 25
        );
        var bz = new THREE.ArrowHelper(
            new THREE.Vector3(0,0,4), i_origin, 120, 0x0000ff, 40, 25
        );

        rx.line.material.linewidth = 5;
        gy.line.material.linewidth = 5;
        bz.line.material.linewidth = 5;

        scene_i.add(rx);
        scene_i.add(gy);
        scene_i.add(bz);

        var label_x_geom = new THREE.TextGeometry(
            'x', {size: 50, height: 0.1}
        );
        var label_x_mat = new THREE.MeshBasicMaterial({
            color: 0xff0000
        });     
        var label_x = new THREE.Mesh(label_x_geom, label_x_mat);

        label_x.position.x = 80;
        label_x.position.y = 20;

        var label_y = new THREE.Mesh(
            new THREE.TextGeometry('y', {size: 50, height:0.1}),
            new THREE.MeshBasicMaterial({color: 0x00ff00})
        );

        label_y.position.x = 20;
        label_y.position.y = 80;
        
        var label_z = new THREE.Mesh(
            new THREE.TextGeometry('z', {size: 50, height: 0.1}),
            new THREE.MeshBasicMaterial({color: 0x00000ff})
        );

        label_z.position.x = -50;
        label_z.position.z = 80;

        scene_i.add(label_x);
        scene_i.add(label_y);
        scene_i.add(label_z);

        var projector = new THREE.Projector();
        mouse = new THREE.Vector2();

        render();
        animate();
    }

    function load_geometry(filename)
    {
        var merge_all_geomerties = false;
        var use_wireframe = false;
        
        waitingDialog.show("Loading geometry", {dialogSize: 'sm'});
        geometry_file = "geometry/" + filename;
        
        $.ajax(
            geometry_file,
            {
                dataType: "json",
                success: function(data) {

                    document.detector_modules = [];

                    if (merge_all_geomerties) {
                        var global_geom = new THREE.Geometry();
                    }

                    for ( var k in data)
                    {
                        var vals = data[k];

                        var vertices = [];

                        
                        for (var i in vals['x'])
                        {
                            vertices.push(
                                new THREE.Vector3(
                                    parseFloat(vals['x'][i]),
                                    parseFloat(vals['y'][i]),
                                    parseFloat(vals['z'][i])
                                )
                            );
                        }
                        
                        var faces = [
                            new THREE.Face3(0, 4, 3),
                            new THREE.Face3(3, 4, 7),
                            new THREE.Face3(3, 7, 2),
                            new THREE.Face3(7, 6, 2),
                            new THREE.Face3(4, 5, 6),
                            new THREE.Face3(6, 7, 4),
                            new THREE.Face3(0, 1, 4),
                            new THREE.Face3(4, 1, 5),
                            new THREE.Face3(0, 3, 1),
                            new THREE.Face3(3, 2, 1),
                            new THREE.Face3(1, 2, 5),
                            new THREE.Face3(2, 6, 5)
                        ];
                        
                        var geom = new THREE.Geometry();
                        geom.vertices = vertices;
                        geom.faces = faces;
                        
                        geom.computeFaceNormals();

                        var shape_mesh;
                        
                        if (use_wireframe) {
                            shape_mesh = new THREE.MeshBasicMaterial({
                                wireframe: true, color: 0x00ff00
                            });
                        } else {
                            shape_mesh = new THREE.MeshNormalMaterial({
                                color:0x0000ff,
                                transparent: true,
                                opacity: 0.2/*,
                                             side: THREE.DoubleSide*/
                            });
                        }
                        
                        var shape = new THREE.Mesh(geom, shape_mesh);

                        shape.data = {
                            "mod_id" : data[k].mod_id,
                            "mod_type" : data[k].mod_id,
                            "identifier": data[k].identifier
                        };
                        
                        document.detector_modules.push(shape);

                        if (merge_all_geomerties) {
                            shape.updateMatrix();
                            global_geom.merge(shape.geometry, shape.matrix);
                        }
                    }

                    if (merge_all_geomerties) {
                        scene.add(
                            new THREE.Mesh(
                                global_geom,
                                new THREE.MeshNormalMaterial()
                            )
                        );
                    }
                    
                    document.geometry_loaded = true;
                    waitingDialog.hide();

                    
                    $("input[value='Load Geometry']").addClass("disabled")
                        .val("Geometry Loaded")
                        .prop('disabled', true);

                    render();
                },
                fail: function(data) {
                    alert("Error loading geometry.");
                    waitingDialog.hide();
                }
            }
        );
    }

    function animate()
    {
        requestAnimationFrame(animate);
        
        camera_i.position.copy( camera.position );
        camera_i.position.sub( controls.target ); // added by @libe
        camera_i.position.setLength( CAM_DISTANCE );
        camera_i.lookAt( scene_i.position );

        controls.update();
    }

    function render()
    {
        renderer.render(scene, camera);
        renderer_i.render(scene_i, camera_i);
    }

    document.loadGeometry = function ()
    {
        if (document.geometry_loaded) {
            return;
        }

        load_geometry("geometry_combined.json");
        
        document.visible_geoms = {
            "B1": false,
            "B2": false,
            "B3": false,
            "B4": false,
            "B5": false,
            "B6": false,
            "E1": false,
            "E2": false,
            "E3": false,
            "E4": false,
            "E5": false,
            "E-1": false,
            "E-2": false,
            "E-3": false,
            "E-4": false,
            "E-5": false
        };
    };

    $(".geom-controls input.btn").click(function(element){

        if (!document.geometry_loaded) {
            alert("Please load geometry first.");
            return;
        }
        
        var target = $(element.currentTarget);
        
        if (target.hasClass("active")) {
            target.removeClass("active");
            document.hideGeomElement(target.attr("value"));
        } else {
            $(element.currentTarget).addClass("active");
            document.showGeomElement(target.attr("value"));
        }
    });

    document.showGeomElement = function (identifier)
    {
        if (!document.visible_modules) {
            document.visible_modules = [];
        }
        if (document.visible_geoms[identifier]) {
            return;
        }
        
        for ( var i in document.detector_modules)
        {
            var mod = document.detector_modules[i];
            if (mod.data.identifier == identifier) {
                scene.add(mod);
                document.visible_modules.push(mod);
            }
        }
        
        document.visible_geoms[identifier] = true;        

        render();
    };
    
    document.hideGeomElement = function (identifier)
    {
        if (!document.visible_geoms[identifier]) {
            return;
        }
        
        for ( var i in document.detector_modules)
        {
            var mod = document.detector_modules[i];
            if (mod.data.identifier == identifier) {
                scene.remove(mod);
            }
        }
        
        document.visible_geoms[identifier] = false;     

        render();
    };

    document.lookXY = function()
    {
        var length = camera.position.length();
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = length;
        camera.up = new THREE.Vector3(0,1,0);
        
        camera.lookAt(new THREE.Vector3(0,0,0));
    };

    document.lookXZ = function ()
    {
        var length = camera.position.length();
        camera.position.x = 0;
        camera.position.y = length;
        camera.position.z = 0;
        camera.up = new THREE.Vector3(1,0,0);
        
        camera.lookAt(new THREE.Vector3(0,0,0));
    };

    document.lookYZ = function ()
    {
        var length = camera.position.length();
        camera.position.x = length;
        camera.position.y = 0;
        camera.position.z = 0;
        camera.up = new THREE.Vector3(0,0,1);
        
        camera.lookAt(new THREE.Vector3(0,0,0));
    };

    document.zoomIn = function ()
    {
        console.log(camera.zoom);
        camera.setZoom(camera.zoom + camera.zoom*0.1);

        render();
    };

    document.zoomOut = function ()
    {
        camera.setZoom(camera.zoom - camera.zoom*0.1);
        render();
    };

    document.moveUp = function ()
    {
        camera.position.x += 10;
        camera.updateProjectionMatrix();
    };

    document.moveDown = function ()
    {
        camera.position.x -= 10;
        camera.updateProjectionMatrix();
    };

    document.unloadEvent = function()
    {
        $('#candidates-table tbody').html();

        console.log("unloading event");

        for (var i in document.event.candidates) {
            console.log("removing candidate from scene");
            scene.remove(document.event.candidates[i].tjs_obj);
        }

        render();
    };        

    document.visualiseEvent = function(event_id)
    {
        if (document.external_data.events.length < event_id + 1) {
            console.err("Event requested is out of range.");
            return;
        }

        if (document.external_data.events.length > 1 &&
            event_id != document.external_data.events.length) {
            $('#next-event-btn').prop('disabled', false);
        }
        
        $("#current-event-container").text(
            document.current_event + 1 + " / " + document.external_data.events.length
        );
        $('#manage-data-btn').prop('disabled', true);
        // put a reference to external method for parsing the data here

        // extract event name
        
        // extract reconstructions
        var candidates_list = document.external_data.events[event_id].candidates;
        $("#cands-no").text(" (" + candidates_list.length + ")");

        document.event = {};

        document.event.candidates = [];
        document.visible_tracks = [];
        document.event.stubs = [];
        
        console.log(candidates_list.length + " candidates found.");

        visualise_points = false;

        var cand_i = 0; // index of candidate
        for ( var i in candidates_list)
        {
            var cand = new Candidate(candidates_list[i], i, scene);


            document.add_candidate(cand);
            
            document.event.candidates.push(cand);
            document.visible_tracks.push(cand);

            if (cand.tjs_obj) {
                scene.add(cand.tjs_obj);
            }
            
            cand_i++;
        }

        document.attach_table_events(scene, render);
        
        render();
    };
    
    document.loadData = function ()
    {
        var filename = $('input[type="radio"]:checked').val();
        
        if (!filename) {
            alert("Please select a filename from the list first.");
            return;
        }

        document.loadEvent(filename);
    };

    document.loadEvent = function (filename)
    {
        if (document.event) {
            return;
            scene.remove(event);
        }
        
        console.log("Loading events/" + filename);

        var full_filename = filename;

        waitingDialog.show("Loading event", {dialogSize: 'sm'});
        $.ajax(
            full_filename,
            {
                dataType: "script",
                processData: true,
                success: function(data) {
                    console.log("Data successfuly loaded from " + full_filename);


                    document.external_data = external_data;
                    document.current_event = 0;
                    
                    document.visualiseEvent(document.current_event);

                    $("#current-event-container").text(document.current_event + 1);
                    
                    waitingDialog.hide();

                    $("input[value='Load Data']").addClass("disabled")
                        .val("Data Loaded")
                        .prop('disabled', true);
                },
                error: function (data, textstatus, error) {
                    console.log("Loading Test Status: " + textstatus);
                    console.log("Eror: " + error);
                    console.log("Error loading data from " + full_filename);
                    
                    waitingDialog.hide();
                }
            }
        );
    };



    document.mouseDown = 0;


    
    function onSceneMouseMove (event)
    {
        // disabled due to camera issues
        return;
        
        if (!document.external_data || document.mouseDown)
            return;
        
        var rect = container.getBoundingClientRect();

        var mouse_x_scene = event.clientX - rect.left;
        var mouse_y_scene = event.clientY - rect.top;
        
        mouse.x = ( mouse_x_scene / scene_width ) * 2 - 1;
        mouse.y = (- mouse_y_scene / scene_height ) * 2 + 1;
        
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(
            document.visible_tracks, true
        );


        if (document.prev_hover_target) {

            document.reset_candidate(document.prev_hover_target, scene, render);
        }

        
        if (intersects.length > 0) {

            var obj = intersects[0].object;
            
            if (obj == document.prev_target) {
                return;
            }

            document.highlight_candidate(obj, scene, render);
        }
    };

    function onSceneMouseDown (event)
    {
        ++document.mouseDown;

        // disabled due to camera issue
        return;
        
        if (!document.external_data)
            return;

        var rect = container.getBoundingClientRect();

        var mouse_x_scene = event.clientX - rect.left;
        var mouse_y_scene = event.clientY - rect.top;

        mouse.x = ( mouse_x_scene / scene_width ) * 2 - 1;
        mouse.y = (- mouse_y_scene / scene_height ) * 2 + 1;
        
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(document.visible_tracks, true);

        if (intersects.length > 0) {

            if (document.prev_target) {

                document.reset_click_candidate(document.prev_target, scene, render);
            }

            var obj = intersects[0].object;

            document.select_candidate(obj, scene, render);
        } 
    };  

    document.setPerspective = function()
    {
        camera.toPerspective();
        //camera.setFov(45);
        render();

        $('#ortho-btn').removeClass('active');
        $('#persp-btn').addClass('active');
    };

    document.setOrthographic = function()
    {
        camera.toOrthographic();
        //camera.setFov(10);
        render();
        
        $('#ortho-btn').addClass('active');
        $('#persp-btn').removeClass('active');
    };

    document.showAll = function ()
    {
        for (var j in document.event.candidates)
        {
            document.showTrack(j);
        }

        render();
    };

    document.hideAll = function()
    {
        document.visible_tracks = [];
        
        for (var i in document.event.candidates)
        {
            document.hideTrack(i);
        }

        render();
    };


    document.showHighlighted = function()
    {
        document.hideAll();

        var id_str = $('#candidates-table tr.info .id-cell small').html();
        var id = parseInt(id_str) - 1;
        var cand = document.event.candidates[id];
        cand.show_info();
        cand.select();

        console.log(id);
        document.showTrack(id);

        render();
    };

    document.showTrack = function(id)
    {
        scene.add(document.event.candidates[id].tjs_obj);
        document.visible_tracks.push(document.event.candidates[id]);

        $('#box-' + id).prop('checked', true);        
    };

    document.hideTrack = function(id)
    {
        document.event.candidates[id].hide_info();
        document.event.candidates[id].restore();
        scene.remove(document.event.candidates[id].tjs_obj);
        
        $('#box-' + id).prop('checked', false);
    };

    document.applyCuts = function ()
    {
        $('#cuts-modal').modal('hide');
        
        if (!document.event) {
            alert("No data loaded.");
            return;
        }
        
        // check candidate constraints
        var min_pt = $('#track-pt-min').val();
        var max_pt = $('#track-pt-max').val();
        
        var min_eta = $('#track-eta-min').val();
        var max_eta = $('#track-eta-max').val();
        
        var min_stubs = $('#track-stubs-min').val();
        var max_stubs = $('#track-stubs-max').val();
        
        var min_sphi = $('#track-sphi-min').val();
        var max_sphi = $('#track-sphi-max').val();
        
        var min_reta = $('#track-reta-min').val();
        var max_reta = $('#track-reta-max').val();

        var track_tp = $('#track-tp').val();

        var min_pt_tp = $('#tp-pt-min').val();
        var max_pt_tp = $('#tp-pt-max').val();
        
        var min_eta_tp = $('#tp-eta-min').val();
        var max_eta_tp = $('#tp-eta-max').val();
        
        
        for (var i in document.event.candidates)
        {
            var cand = document.event.candidates[i];
            var is_valid = true;

            // check tp requirements
            if (is_valid && (min_pt || max_pt)) {

                if (min_pt && cand.data.pt < min_pt) {
                    is_valid = false;
                }

                if (max_pt && cand.data.pt > max_pt) {
                    is_valid = false;
                }
            }
            
            if (is_valid && (min_eta || max_eta)) {

                if (max_eta && cand.data.eta > max_eta) {
                    is_valid = false;
                }

                if (min_eta && cand.data.eta < min_eta) {
                    is_valid = false;
                }
            }
            
            if (is_valid && (min_stubs || max_stubs)) {

                if (min_stubs && cand.data.stubs.length < min_stubs)
                {
                    is_valid = false;
                }

                if (max_stubs && cand.data.stubs.length > max_stubs)
                {
                    is_valid = false;
                }
            }

            
            if (is_valid && track_tp != '-') {
                
                if (track_tp === 'Yes' && !cand.data.tp_obj_coords) {
                    is_valid = false;
                }

                if (track_tp === 'No' && cand.data.tp_obj_coords) {
                    is_valid = false;
                }
            }

            
            if (is_valid && (min_sphi || max_sphi)) {
                
                if (min_sphi && cand.data.sphi < min_sphi)
                {
                    is_valid = false;
                }
                
                if(max_sphi && cand.data.sphi > max_sphi)
                {
                    is_valid = false;
                }
            }

            
            if (is_valid && (min_reta || max_reta)) {
                
                if (min_reta && cand.data.eta < min_reta){
                    is_valid = false;
                }
                
                if(max_reta && cand.data.reta > max_reta) {
                    is_valid = false;
                }
            }

            
            if (is_valid && track_tp == 'Yes' && (min_pt_tp || max_pt_tp)) {

                if (min_pt_tp && min_pt_tp > cand.data.tp_data.pt) {
                    is_valid = false;
                }
                
                if (max_pt_tp && max_pt_tp < cand.data.tp_data.pt) {
                    is_valid = false;
                }
                
            }
            
            if (is_valid && track_tp == 'Yes' && (min_eta_tp || max_eta_tp)) {
                
                if (min_eta_tp && min_eta_tp > cand.data.tp_data.eta) {
                    is_valid = false;
                }
                
                if (max_eta_tp && max_eta_tp < cand.data.tp_data.eta) {
                    is_valid = false;
                }
                
            }
            

            if (is_valid) {
                document.showTrack(i);
            } else {
                document.hideTrack(i);
            }
        }

        render();
    };

    function onWindowResize()
    {
        /**
         * taken from: https://github.com/mrdoob/three.js/issues/69
         */
        if(camera.inPerspectiveMode){
            camera.cameraP.aspect = window.innerWidth / window.innerHeight;
            camera.cameraP.updateProjectionMatrix();
        } else {
            camera.cameraO.left = window.innerWidth / - 2;
            camera.cameraO.right = window.innerWidth / 2;
            camera.cameraO.top = window.innerHeight / 2;
            camera.cameraO.bottom = window.innerHeight / - 2;
            camera.cameraO.updateProjectionMatrix();
        }
        renderer.setSize( window.innerWidth - 5, window.innerHeight - 5 );

        render();

    };
});

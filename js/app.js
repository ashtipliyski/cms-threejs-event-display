$(function() {

	var scene, camera, renderer, container;

	// inset scene elements
	var scene_i, camera_i, renderer_i, container_i;

	// inset constants
	var CANVAS_WIDTH = 50,
		CANVAS_HEIGHT = 50,
		CAM_DISTANCE = 300;
	
	var geometry, material, mesh, plane;

	var scene_width = 700;
	var scene_height = 500;
	
	// scene_width = window.innerWidth;
	// scene_height = window.innerHeight;
	
	init();
	animate();

	function init()
	{
		container = document.getElementById("canvas-container");
		container_i = document.getElementById('inset');
		//		container = document.createElement("div");
		// document.body.appendChild(container);
		
		scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera(
		//camera = new THREE.OrthographicCamera(
			45, scene_width / scene_height, 1, 10000
		);
		camera.position.set(0, 0 ,1000);

		/*
		geometry = new THREE.BoxGeometry(200, 200, 200);
		material = new THREE.MeshNormalMaterial({
			color: 0xff0000, wireframe: true
		});

		mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(300, 300, 300);
		*/
		plane = new THREE.Mesh(
			new THREE.PlaneGeometry(1000,1000),
			new THREE.MeshBasicMaterial({
				color: 0x000,				
				side: THREE.DoubleSide,
				transparent: true,
				opacity: 0.3				
			})
		);

		var line_geometry = new THREE.Geometry();
		/*
		 line_geometry.vertices.push(new THREE.Vector3(-10, 0, 0));
		 line_geometry.vertices.push(new THREE.Vector3(0, 10, 0));
		 line_geometry.vertices.push(new THREE.Vector3(10, 0, 0));
		 */
		line_geometry.vertices.push(new THREE.Vector3(0,0,-800));
		line_geometry.vertices.push(new THREE.Vector3(0,0,800));
		
		var line_material = new THREE.LineBasicMaterial({color:0xff0000});
		var line = new THREE.Line(line_geometry, line_material);


		// sample track
		//Create a closed bent a sine-like wave
		var curve = new THREE.SplineCurve3( [
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( 10, 40, 10 ),
			new THREE.Vector3( 25, 350, 25 ),
			new THREE.Vector3( 400, 0, 400 )
		] );

		var geometry_c = new THREE.Geometry();
		geometry_c.vertices = curve.getPoints( 50 );

		//Create the final Object3d to add to the scene
		var splineObject = new THREE.Line(
			geometry_c, new THREE.LineBasicMaterial({
				color : 0x0011dd,
				linewidth: 5
			})
		);
		
		// add assets to scene
		// scene.add(splineObject);
		scene.add(line);
		// scene.add(plane);
		// scene.add(mesh);

		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor(0xffffff);
		// renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setSize(scene_width, scene_height);
		
		controls = new THREE.TrackballControls(camera, container);

		controls.rotateSpeed = 4.0;
		controls.zoomSpeed = 1.2;
		controls.panSpeed = 0.5;

		controls.noZoom = false;
		controls.noPan = false;

		// controls.staticMoving = true;
		// controls.dynamicDampingFactor = 0.03;

		controls.keys = [ 65, 83, 68 ];

		
		controls.addEventListener( 'change', render );

		//document.body.appendChild(renderer.domElement);
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

		// axes
		axes = new THREE.AxisHelper( 100 );
		scene_i.add( axes );

		render();

		// load_geometry("barrel.json");
		// load_geometry("geom.json");
		//load_geometry("geometry_half.json");
		/*
		load_geometry("barrel1.json");
		load_geometry("barrel2.json");
		load_geometry("barrel3.json");
		load_geometry("barrel4.json");
		 */
	}

	function load_geometry(filename)
	{
		geometry_file = "geometry/" + filename;

		$.ajax(
			geometry_file,
			{
				dataType: "json",
				success: function(data) {
					// data = data[0];
					// console.log(data);

					document.detector_modules = [];

					for ( var k in data)
					{
						// document.detector_modules.push(data[k]);
						
						//if (data[k].identifier.substr(0,1) != "E")
						//	continue;


						var vals = data[k];

						var vertices = [];

						
						for (var i in vals['x'])
						{
							vertices.push(
								new THREE.Vector3(
									vals['x'][i], vals['y'][i], vals['z'][i]
								)
							);
						}

						/*
						var faces = [
							new THREE.Face3(3, 4, 0),
							new THREE.Face3(7, 4, 3),
							new THREE.Face3(2, 7, 3),
							new THREE.Face3(2, 6, 7),
							new THREE.Face3(6, 5, 4),
							new THREE.Face3(4, 7, 6),
							new THREE.Face3(4, 1, 0),
							new THREE.Face3(5, 1, 4),
							new THREE.Face3(1, 3, 0),
							new THREE.Face3(1, 2, 3),
							new THREE.Face3(5, 2, 1),
							new THREE.Face3(5, 6, 2)
						 ];*/
						
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

						var shape = new THREE.Mesh(
							geom,
							//new THREE.MeshBasicMaterial({
							new THREE.MeshNormalMaterial({
								//wireframe: true, color: 0x00ff00
							})
						);

						shape.data = {
							"mod_id" : data[k].mod_id,
							"mod_type" : data[k].mod_id,
							"identifier": data[k].identifier
						};

						document.detector_modules.push(shape);
						// scene.add(shape);// return;
					}

					document.geometry_loaded = true;
					alert("Geometry Loaded");
					render();
				},
				fail: function(data) {
					alert("Error loading geometry.");
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
		load_geometry("geometry_combined.json");
		document.visible_geoms = {
			"B1": false,
			"B2": false,
			"B3": false,
			"B4": false,
			"B5": false,
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
		// alert("clicked");
	});

	document.showGeomElement = function (identifier)
	{
		if (document.visible_geoms[identifier]) {
			return;
		}
		
		for ( var i in document.detector_modules)
		{
			var mod = document.detector_modules[i];
			if (mod.data.identifier == identifier) {
				scene.add(mod);
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

	document.visualiseEvent = function(tracks, stubs, recons)
	{
		
		// put a reference to external method for parsing the data here

		// extract event name

		// extract tracks
		var tracks_list = tracks;					
		$("#tracks_no").text(tracks_list.length);
		
		// extract reconstructions
		var reconstructions_list = recons;
		$("#recons_no").text(reconstructions_list.length);
		
		// extract stubs
		var stubs_list = stubs;
		$("#stubs_no").text(stubs_list.length);

		document.event = {};
		document.event.stubs = [];
		document.event.tracks = [];
		document.event.reconstructions = [];

		for( var key in stubs_list)
		{
			var x = stubs_list[key][0];
			var y = stubs_list[key][1];
			var z = stubs_list[key][2];
			
			var s_geometry = new THREE.SphereGeometry(10, 50, 50);
			
			var stub = new THREE.Mesh(
				s_geometry,
				new THREE.MeshBasicMaterial({color: 0xff0000})
			);
			stub.position.set(x, y, z);

			document.event.stubs.push(stub);

			scene.add(stub);
		}

		for ( var k in tracks_list)
		{
			var v_coords = tracks_list[k];

			
			var vertices_vect = [];
			for (var j in v_coords)
			{
				vertices_vect.push(new THREE.Vector3(
					v_coords[j][0],
					v_coords[j][1],
					v_coords[j][2]
				));
			}

			var curve = new THREE.SplineCurve3(vertices_vect);
			var geom = new THREE.Geometry();
			geom.vertices = curve.getPoints(50);

			var track = new THREE.Line(
				geom,
				new THREE.LineBasicMaterial({
					color: 0x00ff00,
					linewidth: 2
				})
			);

			document.event.tracks.push(track);
			
			scene.add(track);
		}
	};
	
	document.loadData = function ()
	{
		var filename = "test.js";

		document.loadEvent(filename);
	};

	document.loadEvent = function (filename)
	{
		console.log("Loading events/" + filename);

		if (document.event) {
			scene.remove(event);
		}

		var full_filename = "events/" + filename;
		
		$.ajax(
			full_filename,
			{
				dataType: "script",
				processData: true,
				success: function(data) {
					console.log("Data successfuly loaded from " + full_filename);
					console.log(data);
					console.log(external_data);

					document.visualiseEvent(
						external_data.tracks, external_data.stubs, external_data.reconstructions
					);

					document.external_data = external_data;					
				},
				error: function (data, textstatus, error) {
					console.log("Loading Test Status: " + textstatus);
					console.log("Eror: " + error);
					console.log("Error loading data from " + full_filename);
				}
			}
		);
	};
});

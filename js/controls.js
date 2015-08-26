$(function(){

	$("#control-tabs a:last").tab("show");

	document.attach_table_events = function (scene, render)
	{
		// .hover( handlerIn, handlerOut )
		$("#candidates-table tbody tr").hover(function (e){
			// handlerIn

			var cand_id = parseInt($(this).children("td:first").html()) - 1;
			console.log(cand_id);
			var cand = document.event.candidates[cand_id];

			document.highlight_candidate(cand, scene, render);
		}, function (e) {
			// handlerOut

			var cand_id = parseInt($(this).children("td:first").html()) - 1;
			var cand = document.event.candidates[cand_id];
			
			document.reset_candidate(cand, scene, render);
		});

		$("#candidates-table tbody tr").click(function(){
			
			var cand_id = parseInt($(this).children("td:first").html()) - 1;
			var cand = document.event.candidates[cand_id];

			document.select_candidate(cand, scene, render);
		});

		
		// $("#candidates-table").tablesorter();
	};

	document.add_candidate = function (cand)
	{
		/**
		 * Taken from: ttp://stackoverflow.com/questions/5361810/fast-way-to-dynamically-fill-table-with-data-from-json-in-javascript
		 */

		var r = new Array(), j = -1;
		//for (var key=0, size=data.length; key<size; key++){


		var class_name = '';

		/*
<button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="left" title="Tooltip on left">Tooltip on left</button>
		 */

		var tooltip_str = '';

		if (cand.data.tp_data) {
			tooltip_str += 'True particle: \n';
			tooltip_str += 'pt = ' + cand.data.tp_data.pt.toFixed(2) + ' GeV/c; ';
			tooltip_str += 'q = ' + cand.data.tp_data.q.toFixed(0) + 'e; ';
			tooltip_str += 'eta = ' + cand.data.tp_data.eta.toFixed(2) + '; ';
			tooltip_str += 'phi0 = ' + cand.data.tp_data.phi0.toFixed(2) + '; ';
			tooltip_str += 'm = '+ cand.data.tp_data.m.toFixed(2) + ' GeV/c^2 ; ';
		}
		
		r[++j] = '<tr id="el-' + cand.data.id + '" class="'+class_name+'" data-toggle="tooltip" data-placement="left" title="' + tooltip_str + '">';
		r[++j] = '<td class="int" scope="row">';
		r[++j] = parseInt(cand.data.id) + 1;
		r[++j] = '</td><td class="fl" title="'+cand.data.pt.toFixed(4)+'"><small>';
		r[++j] = cand.data.pt.toFixed(2);
		r[++j] = '</small></td><td class="int"><small>';
		r[++j] = cand.data.q.toFixed(0);
		r[++j] = '</small></td><td class="fl"><small>';
		r[++j] = cand.data.eta.toFixed(2);
		r[++j] = '</small></td><td class="fl"><small>';
		r[++j] = cand.data.phi0.toFixed(2);
		r[++j] = '</small></td><td class="fl"><small>';
		console.log(cand.data);
		if (cand.data.tp_obj_coords) {
			r[++j] = "y";
		} else {
			r[++j] = "n";
		}
		r[++j] = '</small></td><td class="fl"><small>';
		r[++j] = cand.data.stubs_coord.length;
		r[++j] = '</small></td></tr>';
		//}
		
		$('#candidates-table tbody').append(r.join(''));
		$('[data-toggle="tooltip"]').tooltip();
		
	};
	
	document.highlight_candidate = function (cand, scene, render)
	{
		//var index = cand.id;
		//document.prev_hover_target = document.event.candidates[index];
		document.prev_hover_target = cand;
		document.prev_hover_material = cand.material;

        cand.material.transparent = true;
		cand.material.linewidth = 4;
		cand.material.opacity = 1;

		// cand.material.color.setHex(0xb85423);
		cand.material.color.setHex(0xff0000);
		
		render();
	};
	
	document.select_candidate = function (cand, scene, render)
	{
		if (document.prev_click_target)
		{
			document.reset_click_candidate(document.prev_click_target, scene, render);
		}
		
		//var index = intersects[0].candect.id;
		//document.prev_target = document.event.candidates[index];
		document.prev_click_target = cand;
		document.prev_material = cand.material;

		cand.show_info();

        cand.material.transparent = true;
        cand.material.opacity = 0.9;
		cand.material.linewidth = 3;
		cand.material.color.setHex(0xaa00dd);

		document.prev_hover_target = null;

		$("#candidates-table tr#el-" + cand.data.id).addClass("info");

		render();
	};

	document.reset_click_candidate = function (cand, scene, render)
	{
		cand.material.opacity = document.prev_material.opacity;
		cand.material.linewidth = document.prev_material.linewidth;
		cand.material.color.setHex(0x0000ff);

		scene.remove(cand);
		scene.add(cand);

		cand.hide_info();

		
		$("#candidates-table tr#el-" + cand.data.id).removeClass("info");

		render();
	};
	
	document.reset_candidate = function (cand, scene, render)
	{
		if (cand == document.prev_click_target)
			return;
		
		//cand.material.opacity = document.prev_hover_material.opacity;
		//cand.material.opacity = 0.5;
		
		//cand.material.linewidth = document.prev_hover_material.linewidth;

		cand.material.opacity = 0.5;
		cand.material.linewidth = 2;
		cand.material.color.setHex(0x0000ff);

		cand.material.needsUpdate = true;
		

		/*
		 scene.remove(cand);
		scene.add(cand);
		 */

		cand.hide_info();

		render();
	};
});

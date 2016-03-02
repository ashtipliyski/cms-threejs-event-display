var Candidate = function (json_data, id, scene)
{
    json_data = json_data || {};

    this.data = {
        "id": id,
        "pt": json_data.pt,
        "q" : json_data.q,
        "eta": json_data.eta,
        "theta": json_data.theta,
        "phi0": json_data.phi0,
        "sphi": json_data.phi_sec,
        "reta": json_data.eta_reg,
        "chi2dof": json_data.chi2dof,
        "tp": {},
        "tp_obj_coords": json_data.track && json_data.track.coords
    };
    
    this.stubs = json_data.stubs || [];
    this.data.tp_data = json_data.track || {};
    this.tp_obj_coords = json_data.track && json_data.track.coords;

    this.scene = scene;

    this.stub_obj_list = [];
    this.tp_obj = {};

    this.tjs_obj = {};
    
    this.generate_mesh(json_data.coords);
};


Candidate.prototype.generate_mesh = function (v_coords)
{
    /**
     * @TODO Change reference to this.scene 
     */
    // configuration variables
    var visualise_points = false;
    
    if (v_coords.length == 0) {
        console.warn("No coords found for object " + this);
        this.tjs_obj = null;
        return;
    }

    var vertices_vect = [];
    for (var m in v_coords)
    {
        vertices_vect.push(new THREE.Vector3(
            v_coords[m][0],
            v_coords[m][1],
            v_coords[m][2]
        ));
        
        if (visualise_points) {
            
            var point = new THREE.Mesh(
                new THREE.SphereGeometry(1.5, 20, 20),
                new THREE.MeshBasicMaterial({color: 0x000000})
            );
            point.position.set(
                v_coords[m][0],
                v_coords[m][1],
                v_coords[m][2]
            );

            this.scene.add(point);
        }
    }

    // track as a line
    var curve = new THREE.SplineCurve3(vertices_vect);
    var geom = new THREE.Geometry();
    geom.vertices = curve.getPoints(vertices_vect.length + 50);

    this.tjs_obj = new THREE.Line(
        geom,
        new THREE.LineBasicMaterial({
            color: 0x0000ff,
            linewidth: 2,
            transparent: true,
            opacity: 0.2
        })
    );

    this.tjs_obj.data_obj = this;

    // this.prototype.constructor = Candidate;

    /*
    cand.data = {};
    
    cand.data.id = cand_i;

    cand.data.stubs_obj_list = [];
    cand.data.stubs = obj.stubs;
    cand.data.tp_obj_coords = obj.track.coords;
    if (obj.track.coords) {
        cand.data.tp_data = {};
        cand.data.tp_data.pt = obj.track.pt;
        cand.data.tp_data.phi0 = obj.track.phi0;
        cand.data.tp_data.eta = obj.track.eta;
        cand.data.tp_data.m = obj.track.m;
        cand.data.tp_data.theta = obj.track.theta;
        cand.data.tp_data.q = obj.track.q;
    }
    cand.data.tp_obj = {};

    cand.data.pt = obj.pt;
    cand.data.q = obj.q;
    cand.data.eta = obj.eta;
    cand.data.phi0 = obj.phi0;
    cand.data.m = obj.m;            
    cand.data.theta = obj.theta;
    cand.data.chi2dof = obj.chi2dof;
    cand.data.sphi = obj.phi_sec;
    cand.data.reta = obj.eta_reg;

     */
};

Candidate.prototype.get_info_text = function ()
{
    if (!this.tjs_obj) {
        console.warn("Candidate does not have corresponding 3d object");
        return "--- Candidate does not have corresponding 3d object ---";
    }
    
    r_text = "";
    
    r_text += "<strong>ID: " + (this.data.id + 1) + "</strong>; ";
    r_text += "p<sub>T</sub>: " + this.data.pt.toFixed(2) + " GeV; ";
    r_text += "&phi;<sub>0</sub>: " + this.data.phi0.toFixed(2) + " ; ";
    r_text += "&eta;: " + this.data.eta.toFixed(2) + " ; ";
    r_text += "q: " + this.data.q + " e; ";
    // r_text += "m: " + this.data.m + " GeV; ";
    // r_text += "&theta;: " + this.data.theta.toFixed(2) + " ; ";
    r_text += "&chi;<sup>2</sup><sub>red</sub>: " +
        this.data.chi2dof.toFixed(2) + " ; ";
    
    r_text += "n<sub>p</sub>: " + this.tjs_obj.geometry.vertices.length + " ; ";

    return r_text;
};

Candidate.prototype.show_stubs = function ()
{

    for( var key in this.stubs)
    {
        var obj = this.stubs[key];
        
        var x = obj.coords[0];
        var y = obj.coords[1];
        var z = obj.coords[2];
        
        var s_geometry = new THREE.SphereGeometry(3, 20, 20);
        var s_color = 0x000000;
        
        if (!obj.genuine) {
            s_color = 0xff0000;
        }
        
        var stub = new THREE.Mesh(
            s_geometry,
            new THREE.MeshBasicMaterial({color: s_color})
        );
        stub.position.set(x, y, z);

        this.scene.add(stub);

        this.stub_obj_list.push(stub);
        document.event.stubs.push(stub);
    }
};

Candidate.prototype.show_info = function ()
{
    // change reference to this.scene
    console.log(this.data.stubs);
    
    for( var key in this.stubs)
    {
        var obj = this.stubs[key];
        
        var x = obj.coords[0];
        var y = obj.coords[1];
        var z = obj.coords[2];
        
        var s_geometry = new THREE.SphereGeometry(3, 20, 20);
        var s_color = 0x000000;
        
        if (!obj.genuine) {
            s_color = 0xff0000;
        }
        
        var stub = new THREE.Mesh(
            s_geometry,
            new THREE.MeshBasicMaterial({color: s_color})
        );
        stub.position.set(x, y, z);

        this.scene.add(stub);

        this.stub_obj_list.push(stub);
        document.event.stubs.push(stub);
    }

    var tracks_list = this.tp_obj_coords;

    var v_coords = tracks_list;

    if (tracks_list) {
        var vertices_vect = [];
        for (var j in v_coords)
        {
            vertices_vect.push(new THREE.Vector3(
                v_coords[j][0],
                v_coords[j][1],
                v_coords[j][2]
            ));
        }

        // track as a line
        var curve = new THREE.SplineCurve3(vertices_vect);
        var geom = new THREE.Geometry();
        geom.vertices = curve.getPoints(50);

        var track = new THREE.Line(
            geom,
            new THREE.LineBasicMaterial({
                color: 0x00ff00,
                linewidth: 10
            })
        );

        this.scene.remove(this.scene.children);
        this.scene.add(track);
        
        this.tp_obj = track;

        document.event.tp = track;

    } else {
        console.warn("no tp for particle");
    }
    
    /*
    // track as a tube
    var mat = new THREE.MeshBasicMaterial({color: 0x00ff00});
    var tubeGeometry = new THREE.TubeGeometry(
        new THREE.SplineCurve3(vertices_vect), 60, 1
    );
    var track = new THREE.Mesh(tubeGeometry, mat);
     */
};

Candidate.prototype.hide_info = function ()
{
    for (var n in this.stub_obj_list)
    {
        this.scene.remove(this.stub_obj_list[n]);
    }

    this.scene.remove(this.tp_obj);

    document.event.tp = null;
    document.event.stubs = [];
};

Candidate.prototype.select = function ()
{
    if (!this.tjs_obj) {
        console.warn("Candidate does not have corresponding tjs object");
        return;
    }
    
    this.tjs_obj.material.transparent = true;
    this.tjs_obj.material.opacity = 0.9;
    this.tjs_obj.material.linewidth = 5;
    this.tjs_obj.material.color.setHex(0xaa00dd);
};

Candidate.prototype.highlight = function ()
{
    if (!this.tjs_obj) {
        console.warn("Candidate does not have corresponding tjs object");
        return;
    }
    
    this.tjs_obj.material.transparent = true;
    this.tjs_obj.material.linewidth = 4;
    this.tjs_obj.material.opacity = 1;

    // this.tjs_obj.material.color.setHex(0xb85423);
    this.tjs_obj.material.color.setHex(0xff0000);
};

Candidate.prototype.restore = function ()
{
    if (!this.tjs_obj) {
        console.warn("Candidate does not have corresponding tjs object");
        return;
    }
    
    this.tjs_obj.material.opacity = 0.2; //document.prev_material.opacity;
    this.tjs_obj.material.linewidth = 2;//document.prev_material.linewidth;
    this.tjs_obj.material.color.setHex(0x0000ff);
};

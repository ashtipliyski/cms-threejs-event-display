# Loading Detector Geometry

A working version of the geometry for the Phase II upgraded Outer Tracker for CMS was used to generate a representation of the detector that could loaded into the visualiser. This was done so that different elements of the collision data can be better put into perspective relative to global topology of the event. It was hoped that this would also help in identifying which detector components/regions were involved in different quality reconstructions of tracks.

The detector geometry is stored in a file external to the application so that can be loaded on demand and not slow down the initial loading of the visualiser. Before the geometry can be visualised on the 3D scene it is necessary to load it into the application. This can be done by navigating to the *Geometry* top level menu item, followed by clicking on *Load Geometry* at bottom of controls panel.

## Detector Geometry Format

Similarly to the collision data files, a JSON formatted ASCII text file was used to create a description of the detector geometry. The upgraded detector would have its sensors paired in groups of two that could individually detect properties of the passing particles, which in turn can be used for triggering decision regarding those particles. For use in the visualiser a simplified version of this arrangement was used where each pair of modules was combined into a single cuboid containing both sensor pairs.

The geometry data file contains a list of *segment* objects, each containing the following information

    {
        "identifier": <"B" for barrel or "E" for endcap>,
        "mod_type": <1 for PS or 0 for 2S>,
        "mod_id": <unique id of module>,
        "x": [x1, x2, x3, x4, x5, x6, x7, x8],
        "y": [y1, y2, y3, y4, y5, y6, y7, y8],
        "z": [z1, z2, z3, z4, z5, z6, z7, z8]
    }

where the position coordinates are given as a list of all the vertices of the cuboid measured in cm.

## Toggling visibility of detector elements

Once the geometry description (file) has been loaded into the application, the geometry visibility controls will become enabled. There are three groups of buttons, one for the barrel layers (labelled named B1-B6) and two for each endcap group (labelled E1-E5). The number in the button name corresponds to the layer of modules and it increases with the distance away from the interaction point at (0,0,0). Note that the negative numbers on one of the endcap groups represent the fact that it is located in the negative z region.

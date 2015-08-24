# CMS Track Visualiser

## Usage Instructions

### Application Layout:

The left side of the screen is dedicated to the 3D rendering area, where by default only the beam is visualised as a thick grey line, together with a small red square at the bottom left corner of the area which holds an indicator of the orientation of the Cartesian coordinate system.

The right panel of the screen is filled with various display elements and control elements that provide information about the currently loaded event and allow for modification of the 3D scene on the left. Currently, the area is split into Event Summary display panel, View controls for fine control over the position of the camera in the 3D scene and a panel for controlling the visibility of the detector geometry.

### Loading Detector Geometry:

The detector geometry was exported from **true** model used in CMSSW based simulation into a ASCII text file which allows for dynamic loading and flexibility. Geometry into can be loaded into the Viewer by pressing "Load Geometry" which will download the model text file from the server and parse it so that it is ready for visualisation. Once the geometry is loaded, modules can be switched on and off by clicking on the buttons labelled with a B or E prefix for barrel and endcap respectively.

#### Loading Event Data:

Similarly to the detector geometry, the event data is stored in plain ASCII files (JSON formatted) and can be loaded on demand. This can be done by clicking on the "Load Data" button in the Event Summary panel. Currently, only a single event file is available the location of which is hardcoded in the application code. This is done for testing purposes and in the final version of the Viewer there will be the ability to load different events.

Once the data file has been loaded and parsed, the event components will be visualised in the 3D scene. The test event file used contains a small number of "tracks" processed from a **full** detector simulation, implemented in CMSSW. The elements of the event shown are fitted candidate tracks, represented by blue lines and stubs used to reconstruct those tracks, as red spheres. The next iteration of the application would allow for the handling of higher number of candidates by offering the ability to select candidates and change the visibility of their associated stubs true tracks and stubs on and off.

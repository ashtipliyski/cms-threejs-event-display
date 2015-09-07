# CMS Track Visualiser

## Usage Instructions

### Application Layout:

The left side of the screen is dedicated to the 3D rendering area, where by default only the beam is visualised as a thick grey line, together with a small square square at the bottom left corner of the area which holds an indicator of the orientation of the Cartesian coordinate system.

The main control panels are currently placed on the right of the screen and can be togged using the Event and Geometry buttons on top of the page. The Geometry panel offers camera visibility controls and a set of interfaces for loading and toggling the visibility of different detector geometry modules.

Under Event, a set of controls is defined that helps in the exploration of the currently loaded parcicle collision event. These provide access to filtering functionality that can be used to change the currently visualised information in the 3D display area. The main component in the panel is the data table which visualises the track candidates and their corresponding kinematic parameters. The kinematic parameters of the associated true particle can be seen by hovering on an entry in the table. The entries that do not have an associated true particle are highlighted in red and this hover functionality is disabled for them.

### Loading Detector Geometry:

The detector geometry was exported from **true** model used in CMSSW based simulation into a ASCII text file which allows for dynamic loading and flexibility. Geometry into can be loaded into the Viewer by pressing "Load Geometry" which will download the model text file from the server and parse it so that it is ready for visualisation. Once the geometry is loaded, modules can be switched on and off by clicking on the buttons labelled with a B or E prefix for barrel and endcap respectively.

#### Loading Event Data:

Similarly to the detector geometry, the event data is stored in plain ASCII files (JSON formatted) and can be loaded on demand. This can be done by clicking on the "Load Data" button in the Event Summary panel. Currently, only a single event file is available the location of which is hardcoded in the application code. This is done for testing purposes and in the final version of the Viewer there will be the ability to load different events.

Once the data file has been loaded and parsed, the event components will be visualised in the 3D scene. The test event file used contains a small number of "tracks" processed from a **full** detector simulation, implemented in CMSSW. The elements of the event shown are fitted candidate tracks, represented by blue lines and stubs used to reconstruct those tracks, as red spheres. The next iteration of the application would allow for the handling of higher number of candidates by offering the ability to select candidates and change the visibility of their associated stubs true tracks and stubs on and off.

### Exploring event data 


## Dependencies

- jQuery
- Bootstrap
  + bootstrap waitingfor plugin 
- tablesorter jQuery plugin: https://github.com/Mottie/tablesorter
- three.js - main library
  + three.js - Trackball Controls
  + three.js - Combined Camera
  + three.js - helvetiker typeface
  + three.js - Projector.js (this needs to be moved)
  + 

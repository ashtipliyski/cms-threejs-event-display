# Loading data into the visualiser

Loading data into the visualiser is essential to make use of the application. This article describes the data format used by the visualiser, how to get data out of the CMSSW framework and the different ways in which data can be loaded into the application.

## Data format

The visualiser uses a JSON formatted ASCII text file to describe the event data and its components. The use of JSON allows to add structure to the data which in turn allows to relate the different data elements. The current implementation of the format also supports multiple events stored in a list, each in a separate *event* object.

There are three types of data elements described in the file relating to **stubs**, **fitted particle candidates** (candidates) and **true/tracking particles** (TP).

### Hierarchy structure

The data elements are structured in the following way:

- events list
  + candidates list
    * candidate data
        - coordinates
        - kinematic parameters (p<sub>t</sub>, etc.)
    * candidate stubs
        - coordinates
        - descriptive parameters
    * candidate tp
        - coordinates
        - kinematic parameters(p<sub>t</sub>, etc.)

### JSON sample

Above structure roughly traslates to the following JSON code

    {
        "events": [
            {
                "candidates": [
                    {
                        "pt":      <value>,
                        "phi0":    <value>,
                        "q":       <value>,
                        "eta":     <value>,
                        "theta":   <value>,
                        "chi2dof": <value>,
                        "eta_reg": <value>,
                        "phi_sec": <value>,
                        "coords": [[x1,y1,z1], ... , [xn, yn, zn]],
                        
                        "stubs":[
                            "coords": [x,y,z],
                            "genuine": <true/false>
                        ],
                            
                        "tp": {
                            "pt":    <value>,
                            "phi0":  <value>,
                            "q":     <value>,
                            "m":     <value>,
                            "eta":   <value>,
                            "theta": <value>,
                            "coords": [[x1,y1,z1], ... , [xn, yn, zn]]
                        }
                    }
                ]
            },
            ...
        ]
    }

where the top level object also hold descriptive information about the data file itself, such as when the file was generated, the size of the sample, type of events included, etc.

### Generating trajectories

Most of the contents in the data file is taken directly from the simulation objects and is included in the JSON structure as it. This is with the exception of the trajectory coordinates which need to be generated using the kinematic parameters in a format that is suitable for visualisation with the library used for the 3D rendering.

The trajectory of candidates/particles is generated once the kinematic parameters of the object are know and the the strength of magnetic field in which it travels is taken in to account. In the current implementation of the JSON generation script, the following dependence of the position coordinates on kinematic parameters is used:

> x(d<sub>0</sub>, q, &phi;<sub>0</sub>, R, &phi;)

> y(d<sub>0</sub>, q, &phi;<sub>0</sub>, R, &phi;)

> z(z<sub>0</sub>, &theta;, R, &phi;)

where the meaning of the parameters used is:

 - **d<sub>0</sub>**: Impact parameter in x-y plane
 - **z<sub>0</sub>**: Impact parameter along z-axis
 - **q**: Particle charge
 - **R**: Helical radius in cm
 - **&phi;<sub>0</sub>**: Azimuthal angle of the initial particle momentum 
 - **&phi;**: Azimuthal angle &phi;(t) - free parameter
 - **&theta;**: Angle of between a point on the trajectory and z-axis

**Note:** Helical radius is defined as *R = p<sub>T</sub> / (0.003 &times; B &times; q)*, where B is magnetic field strength in Tesla and p<sub>T</sub> transverse momentum in GeV.

To parameterise the trajectory, a collection of points is taken along its length and those are stored in the JSON file. These points are calculated along the trajectory by using the azimuthal angle &phi; as a free parameter. The value of &phi; is incremented until the resultant point is established to lie outside the detector geometry (when it has |z| > 265 cm or radial distance from z-axis, r > 108 cm).
    
## Exporting data from CMSSW (CMS Software)

The JSON generation script is implemented as an EDM (Event Data Model) plugin that needs to be run after the Track Trigger and Track Trigger Associator modules.

## Working with local data files

In order to allow for quick use of locally generated data files and prevent the conflict of data files stored on a single remote application by different users, the visualiser supports the use of loading of data files from the local filesystem.

To load a local file the user needs to navigate to *Event &rarr; Manage Data &rarr; Local*, then select a file from their filesystem by either clicking on the rectangular *drop area* to open a file selection menu or dragging and dropping a collection of files onto it. Once the files have been selected, they should become visible as a list of radio buttons under the drop area. To view the contents of a listed file into the visualiser, the user needs to  select it from the list and press *Load Data*.

Unless there were errors in loading and parsing the file, the user should now see the contents of the file in the 3D scene and the data table.

For details on how to explore the loaded data, refer to [How To: Exploring Event Data](https://github.com/ashtipliyski/cms-threejs-event-display/wiki/How-To:-Exploring-Event-Data)

## Working with remote data files

The ability to load data files hosted in a central location visible on the internet has also been implemented as part of the visualiser. These can be uploaded over (s)FTP and are stored in the /events folder relative to the application root. To request access to the remote folder please contact the author. The files located in the remote folder are updated every time the visualiser page is loaded (refreshed) so the user can expect near real-time access to the files hosted there.

To load a local file the user needs to navigate to *Event &rarr; Manage Data &rarr; Remote*, select one of the listed data files by clicking on it and press *Load Data* to load the contents of the file into the visualiser. 

Unless there were errors in loading and parsing the file, the user should now see the contents of the file in the 3D scene and the data table.

For details on how to explore the loaded data, refer to [How To: Exploring Event Data](https://github.com/ashtipliyski/cms-threejs-event-display/wiki/How-To:-Exploring-Event-Data)
    

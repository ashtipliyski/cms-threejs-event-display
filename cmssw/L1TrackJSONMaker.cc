// https://github.com/skinnari/cmssw/blob/TTI_62X_TrackTriggerObjects/SLHCUpgradeSimulations/L1TrackTrigger/test/L1TrackJSONMaker.cc
//////////////////////////////////////////////////////////////////////
//                                                                  //
//  Analyzer for making mini-ntuple for L1 track performance plots  //
//                                                                  //
//////////////////////////////////////////////////////////////////////

////////////////////
// FRAMEWORK HEADERS
#include "FWCore/PluginManager/interface/ModuleDef.h"
#include "FWCore/Framework/interface/MakerMacros.h"
#include "FWCore/Framework/interface/EDAnalyzer.h"
#include "FWCore/Framework/interface/Event.h"
#include "FWCore/Framework/interface/ESHandle.h"
#include "FWCore/Framework/interface/EventSetup.h"
#include "FWCore/MessageLogger/interface/MessageLogger.h"
#include "FWCore/Utilities/interface/InputTag.h"
#include "FWCore/ParameterSet/interface/ParameterSet.h"
#include "FWCore/ServiceRegistry/interface/Service.h"

///////////////////////
// DATA FORMATS HEADERS
#include "DataFormats/Common/interface/Handle.h"
#include "DataFormats/Common/interface/EDProduct.h"
#include "DataFormats/Common/interface/Ref.h"
#include "FWCore/Utilities/interface/InputTag.h"

#include "DataFormats/L1TrackTrigger/interface/TTTypes.h"
#include "DataFormats/L1TrackTrigger/interface/TTCluster.h"
#include "DataFormats/L1TrackTrigger/interface/TTStub.h"
#include "DataFormats/L1TrackTrigger/interface/TTTrack.h"

#include "SimDataFormats/TrackingAnalysis/interface/TrackingParticle.h"
#include "SimDataFormats/TrackingAnalysis/interface/TrackingVertex.h"
#include "SimDataFormats/TrackingHit/interface/PSimHitContainer.h"
#include "SimDataFormats/TrackingHit/interface/PSimHit.h"
#include "SimTracker/TrackTriggerAssociation/interface/TTClusterAssociationMap.h"
#include "SimTracker/TrackTriggerAssociation/interface/TTStubAssociationMap.h"
#include "SimTracker/TrackTriggerAssociation/interface/TTTrackAssociationMap.h"
#include "Geometry/Records/interface/StackedTrackerGeometryRecord.h"
#include "Geometry/TrackerGeometryBuilder/interface/StackedTrackerGeometry.h"

////////////////////////////
// DETECTOR GEOMETRY HEADERS
#include "MagneticField/Engine/interface/MagneticField.h"
#include "MagneticField/Records/interface/IdealMagneticFieldRecord.h"
#include "Geometry/TrackerGeometryBuilder/interface/TrackerGeometry.h"
#include "Geometry/TrackerGeometryBuilder/interface/PixelGeomDetUnit.h"
#include "Geometry/TrackerGeometryBuilder/interface/PixelGeomDetType.h"
#include "Geometry/TrackerGeometryBuilder/interface/PixelTopologyBuilder.h"
#include "Geometry/Records/interface/TrackerDigiGeometryRecord.h"
#include "Geometry/TrackerGeometryBuilder/interface/RectangularPixelTopology.h"
#include "Geometry/CommonDetUnit/interface/GeomDetType.h"
#include "Geometry/CommonDetUnit/interface/GeomDetUnit.h"
#include "Geometry/TrackerGeometryBuilder/interface/StackedTrackerDetUnit.h"
#include "DataFormats/SiPixelDetId/interface/StackedTrackerDetId.h"

////////////////
// PHYSICS TOOLS
#include "CommonTools/UtilAlgos/interface/TFileService.h"

///////////////
// ROOT HEADERS
#include <TROOT.h>
#include <TFile.h>

//////////////
// STD HEADERS
#include <string>
#include <iostream>
#include <fstream>

//////////////
// NAMESPACES
using namespace std;
using namespace edm;


//////////////////////////////
//                          //
//     CLASS DEFINITION     //
//                          //
//////////////////////////////

class L1TrackJSONMaker : public edm::EDAnalyzer
{
public:

  // Constructor/destructor
  explicit L1TrackJSONMaker(const edm::ParameterSet& iConfig);
  virtual ~L1TrackJSONMaker();

  // Mandatory methods
  virtual void beginJob();
  virtual void endJob();
  virtual void analyze(const edm::Event& iEvent, const edm::EventSetup& iSetup);
  
protected:
  
private:
  
  // Containers of parameters passed by python configuration file
  edm::ParameterSet config; 
  
  int MyProcess;
  bool DebugMode;

  edm::InputTag L1TrackInputTag;
  edm::InputTag MCTruthTrackInputTag;

  // open output file
  ofstream event_file;

  int events_num;
  int event_counter;
};

// -----------------------------------
// JSON generation specific methods
// -----------------------------------

/**
 * Returns the x coordinate of a trajectory parameterised in phi
 *
 * Method takes in the kinematic parameters of the particle to calculate the
 * x-coordinate of the particle trajectory as a function of the azimuthal
 * angle phi (in radians). The method is used, together with the equivalent
 * versions for y- and z-) to compile several points in 3 space along the
 * trajectory so that it can be visualised as a spline between those points.
 *
 * @param d0     Impact parameter in x-y plane (in cm)
 * @param charge Charge of particle (+/- 1)
 * @param phi    Azimuthal angle of point along trajectory (rad) - free param
 * @param theta  Angle between initial particle velocity and z axis (in rad)
 * @param R      Radius of helical trajectory in cm (related to pt and B)
 * @param phi0   Initial angle phi (between x-axis and x-y projection of v0)
 *
 * @return X position of trajectory for given value of phi, expressed in cm.
 */
double x(double d0, int charge, double phi, double R, double phi0) 
{
  return - charge * R * sin( phi0 - charge * phi) + (d0 + charge * R) * sin(phi0);
};


/**
 * Returns the y coordinate of a trajectory parameterised in phi
 *
 * Method takes in the kinematic parameters of the particle to calculate the
 * y-coordinate of the particle trajectory as a function of the azimuthal
 * angle phi (in radians). The method is used, together with the equivalent
 * versions for z- and x-) to compile several points in 3 space along the
 * trajectory so that it can be visualised as a spline between those points.
 *
 * @param d0     Impact parameter in x-y plane (in cm)
 * @param charge Charge of particle (+/- 1)
 * @param phi    Azimuthal angle of point along trajectory (rad) - free param

 * @param theta  Angle between initial particle velocity and z axis (in rad)
 * @param R      Radius of helical trajectory in cm (related to pt and B)
 * @param phi0   Initial angle phi (between x-axis and x-y projection of v0)
 *
 * @return y position of trajectory for given value of phi, expressed in cm.
 */
double y(double d0, int charge, double phi, double R, double phi0) 
{
  return charge * R * cos( phi0 - charge * phi) - (d0 + charge * R) * cos(phi0);
};

/**
 * Returns the z coordinate of a trajectory parameterised in phi
 *
 * Method takes in the kinematic parameters of the particle to calculate the
 * z-coordinate of the particle trajectory as a function of the azimuthal
 * angle phi (in radians). The method is used, together with the equivalent
 * versions for y- and x-) to compile several points in 3 space along the
 * trajectory so that it can be visualised as a spline between those points.
 *
 * @param d0     Impact parameter in x-y plane (in cm)
 * @param charge Charge of particle (+/- 1)
 * @param phi    Azimuthal angle of point along trajectory (rad) - free param
 * @param theta  Angle between initial particle velocity and z axis (in rad)
 * @param R      Radius of helical trajectory in cm (related to pt and B)
 * @param phi0   Initial angle phi (between x-axis and x-y projection of v0)
 *
 * @return z position of trajectory for given value of phi, expressed in cm.
 */
double z(double z0, double phi, double R, double theta) 
{
  return z0 + R * phi / tan(theta);
};

void generate_trajectory(
  double d0, double z0, double q, double R, double phi0, double theta, ostream & o_stream
  )
{
  double r_limit = 108;
  double z_limit = 265;

  double phi_step = M_PI/20;

  double r = 0;
  double phi = 0;

  double xx, yy, zz = 0;

  unsigned int i = 0;

  while (r < r_limit && sqrt(pow(zz, 2)) < z_limit)
  {
	xx = x(d0, q, phi, R, phi0);
	yy = y(d0, q, phi, R, phi0);
	zz = z(z0, phi, R, theta);

	r = sqrt(pow(xx, 2) + pow(yy, 2));

	o_stream << "[" << xx << "," << yy << "," << zz << "]";

	// add a semi-column in between each point along the trajectory
	if (r < r_limit && sqrt(pow(zz, 2)) < z_limit){
	  o_stream << ",";
	}

	phi += phi_step;

	i++;
  }

};

//////////////////////////////////
//                              //
//     CLASS IMPLEMENTATION     //
//                              //
//////////////////////////////////

//////////////
// CONSTRUCTOR
L1TrackJSONMaker::L1TrackJSONMaker(edm::ParameterSet const& iConfig) : 
  config(iConfig)
{
  MyProcess = iConfig.getParameter< int >("MyProcess");
  DebugMode = iConfig.getParameter< bool >("DebugMode");

  L1TrackInputTag = iConfig.getParameter<edm::InputTag>("L1TrackInputTag");
  MCTruthTrackInputTag = iConfig.getParameter<edm::InputTag>("MCTruthTrackInputTag");

  events_num = iConfig.getParameter<int>("Events");
}

/////////////
// DESTRUCTOR
L1TrackJSONMaker::~L1TrackJSONMaker()
{
}  

////////////
// BEGIN JOB
void L1TrackJSONMaker::beginJob()
{
  // things to be done before entering the event Loop
  cerr << "L1TrackJSONMaker::beginJob" << endl;
	
  /**
   * @NOTE Due to particularity in the way JavaScript handles string data,
   *       the export file must be a valid JS file instead of  a JSON file.
   */
  event_file.open("test_full_takashi_single.js");
	
  // define data variable for JavaScript
  event_file << "var external_data = {";

  event_file << "\"events\":";

  // open events list
  event_file << "[";

  event_counter = 0;

}


//////////
// ANALYZE
void L1TrackJSONMaker::analyze(const edm::Event& iEvent, const edm::EventSetup& iSetup)
{
  // create event json object

  event_file << "{";

  // open fitted candidates list
  event_file << "\"candidates\":[";

  //------------------------------------------------------------------------------------------
  // retrieve various containers
  //------------------------------------------------------------------------------------------

  // L1 tracks
  edm::Handle< std::vector< TTTrack< Ref_PixelDigi_ > > > TTTrackHandle;
  //iEvent.getByLabel("TTTracksFromPixelDigis", "Level1TTTracks", TTTrackHandle);
  iEvent.getByLabel(L1TrackInputTag, TTTrackHandle);
  
  // L1 stubs
  edm::Handle< edmNew::DetSetVector< TTStub< Ref_PixelDigi_ > > > TTStubHandle;
  iEvent.getByLabel("TTStubsFromPixelDigis", "StubAccepted", TTStubHandle);

  // MC truth association maps
  edm::Handle< TTTrackAssociationMap< Ref_PixelDigi_ > > MCTruthTTTrackHandle;
  iEvent.getByLabel(MCTruthTrackInputTag, MCTruthTTTrackHandle);
  edm::Handle< TTClusterAssociationMap< Ref_PixelDigi_ > > MCTruthTTClusterHandle;
  iEvent.getByLabel("TTClusterAssociatorFromPixelDigis", "ClusterAccepted", MCTruthTTClusterHandle);
  edm::Handle< TTStubAssociationMap< Ref_PixelDigi_ > > MCTruthTTStubHandle;
  iEvent.getByLabel("TTStubAssociatorFromPixelDigis", "StubAccepted", MCTruthTTStubHandle);

  // tracking particles
  edm::Handle< std::vector< TrackingParticle > > TrackingParticleHandle;
  edm::Handle< std::vector< TrackingVertex > > TrackingVertexHandle;
  iEvent.getByLabel("mix", "MergedTrackTruth", TrackingParticleHandle);
  iEvent.getByLabel("mix", "MergedTrackTruth", TrackingVertexHandle);

  // geometry 
  edm::ESHandle< StackedTrackerGeometry >         StackedGeometryHandle;
  const StackedTrackerGeometry*                   theStackedGeometry = 0;

  iSetup.get< StackedTrackerGeometryRecord >().get(StackedGeometryHandle);
  theStackedGeometry = StackedGeometryHandle.product();

  // magnetic field
  edm::ESHandle< MagneticField > magneticFieldHandle;
  iSetup.get< IdealMagneticFieldRecord >().get(magneticFieldHandle);

  const MagneticField* theMagneticField = magneticFieldHandle.product();
  double mMagneticFieldStrength = theMagneticField->inTesla(GlobalPoint(0,0,0)).z();

  // ----------------------------------------------------------------------------------------------
  // loop over L1 tracks
  // ----------------------------------------------------------------------------------------------
  cout << TTTrackHandle->size() << " tracks found." << endl;

  // counter for current element
  unsigned int j = 0; 
  const float field = mMagneticFieldStrength;
    
  int this_l1track = 0;
  std::vector< TTTrack< Ref_PixelDigi_ > >::const_iterator iterL1Track;
  for ( iterL1Track = TTTrackHandle->begin(); iterL1Track != TTTrackHandle->end(); iterL1Track++ ) {
      
	edm::Ptr< TTTrack< Ref_PixelDigi_ > > l1track_ptr(TTTrackHandle, this_l1track);
	this_l1track++;
      
	float tmp_trk_pt   = iterL1Track->getMomentum().perp();
	float tmp_trk_eta  = iterL1Track->getMomentum().eta();
	float tmp_trk_phi  = iterL1Track->getMomentum().phi();
	float tmp_trk_z0   = iterL1Track->getPOCA().z(); //cm
	float tmp_trk_chi2 = iterL1Track->getChi2();
	float tmp_trk_consistency = iterL1Track->getStubPtConsistency();
	int tmp_trk_nstub  = (int) iterL1Track->getStubRefs().size();

	// added by Antoni (17/09/2015)
	float tmp_trk_R = abs(1/iterL1Track->getRInv());
	float tmp_trk_q = 1;

	// use the sign of the curvature as a proxy for particle charge
	if (iterL1Track->getRInv() < 0) {
	  tmp_trk_q = -1;
	}

	float tmp_trk_d0 = iterL1Track->getPOCA().perp();
	float tmp_trk_theta = iterL1Track->getMomentum().theta();
	float tmp_trk_chi2red = iterL1Track->getChi2Red();
	float tmp_trk_reg = iterL1Track->getWedge();
	float tmp_trk_sec = iterL1Track->getSector();

	event_file << "{";
	event_file << "\"pt\":" << tmp_trk_pt << ",";
	event_file << "\"phi0\":" << tmp_trk_phi << ",";
	event_file << "\"q\":" << tmp_trk_q << ",";
	event_file << "\"eta\":" << tmp_trk_eta << ",";
	event_file << "\"theta\":" << tmp_trk_theta << ",";
	event_file << "\"chi2dof\":" << tmp_trk_chi2red << ",";
	event_file << "\"eta_reg\":" << tmp_trk_reg << ",";
	event_file << "\"phi_sec\":" << tmp_trk_sec << ",";

	event_file << "\"stubs\":" << "[";
	// generating stub string

	std::vector< edm::Ref< edmNew::DetSetVector< TTStub< Ref_PixelDigi_ > >, TTStub< Ref_PixelDigi_ > > > theStubRefs =
	  iterL1Track->getStubRefs();

	unsigned int iStub = 0;
	for (size_t iStub = 0; iStub < theStubRefs.size(); iStub++)
	{
	  const TTStub<Ref_PixelDigi_> *ttStub = theStubRefs.at(iStub).get();

	  GlobalPoint posStub = 
		theStackedGeometry->findGlobalPosition(ttStub);

	  float tmp_stub_x = posStub.x();
	  float tmp_stub_y = posStub.y();
	  float tmp_stub_z = posStub.z();


	  event_file << "{";
	  event_file << "\"coords\":[";
	  event_file << tmp_stub_x << "," << tmp_stub_y << "," << tmp_stub_z;
	  event_file << "],";

	  event_file << "\"genuine\":" <<
		MCTruthTTStubHandle->isGenuine(theStubRefs.at(iStub));

	  event_file << "}";

	  if (iStub < theStubRefs.size()-1 ) {
		event_file << ",";
	  }
	}

	event_file << "],";
	event_file << "\"track\": {";

	edm::Ptr< TrackingParticle > my_tp =
	  MCTruthTTTrackHandle->findTrackingParticlePtr(l1track_ptr);

	// generating tp string
	if (!my_tp.isNull()) {

	  float tp_pt = my_tp->p4().pt();
	  float tp_eta = my_tp->p4().eta();
	  float tp_phi = my_tp->p4().phi();
	  float tp_theta = my_tp->p4().theta();
	  float tp_q = my_tp->charge();
	  float tp_m = my_tp->mass();

	  float tp_x0 = my_tp->vertex().x();
	  float tp_y0 = my_tp->vertex().y();
	  float tp_z0 = my_tp->vertex().z();
	  float tp_d0 = sqrt(pow(tp_x0,2) + pow(tp_y0,2));

	  float tp_r = 100 * abs(tp_pt/((0.3) * tp_q * field)); // prefactor is for cm

	  event_file << "\"pt\":" << tp_pt << ",";
	  event_file << "\"phi0\":" << tp_phi << ",";
	  event_file << "\"q\":" << tp_q << ",";
	  event_file << "\"m\":" << tp_m << ",";
	  event_file << "\"eta\":" << tp_eta << ",";
	  event_file << "\"theta\":" << tp_theta << ",";
	  event_file << "\"coords\":" << "[";

	  // generate tp coords
	  generate_trajectory(
		tp_d0, tp_z0, tp_q, tp_r, tp_phi, tp_theta, event_file
		);

	  event_file << "]";
	}
			
	event_file << "},";

	event_file << "\"coords\":[";

	generate_trajectory(
	  tmp_trk_d0,
	  tmp_trk_z0,
	  tmp_trk_q,
	  tmp_trk_R,
	  tmp_trk_phi,
	  tmp_trk_theta,
	  event_file
	  );
			
	event_file << "]";
	event_file << "}";

	// cout << j << " " << TTTrackHandle->size() << endl;
	if (j <= TTTrackHandle->size()-2) {
	  event_file << ",";
	}

	j++;
  }//end track loop
  
	// close list of candidates
  event_file << "]";

  // close event object
  event_file << "}";

  if (event_counter < events_num - 1) {
	event_file << ",";
  }

  event_counter++;

} // end of analyze()


//////////
// END JOB
void L1TrackJSONMaker::endJob()
{
  // things to be done at the exit of the event Loop
  cerr << "L1TrackJSONMaker::endJob" << endl;

  // close events list
  event_file << "]";
	
  // close JSON variable
  event_file << "};";	
	
  // close outputfile
  event_file.close();
}

///////////////////////////
// DEFINE THIS AS A PLUG-IN
DEFINE_FWK_MODULE(L1TrackJSONMaker);

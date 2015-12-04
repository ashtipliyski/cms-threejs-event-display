############################################################
# define basic process
############################################################

import FWCore.ParameterSet.Config as cms
import FWCore.ParameterSet.VarParsing as VarParsing
import FWCore.Utilities.FileUtils as FileUtils

process = cms.Process("L1TrackJSON")
 
 
############################################################
# import standard configurations
############################################################

process.load('Configuration.StandardSequences.Services_cff')
process.load('FWCore.MessageService.MessageLogger_cfi')
process.load('Configuration.EventContent.EventContent_cff')
process.load('Configuration.Geometry.GeometryExtended2023TTIReco_cff')
process.load('Configuration.StandardSequences.MagneticField_38T_PostLS1_cff')
process.load('Configuration.StandardSequences.L1TrackTrigger_cff')
process.load('Configuration.StandardSequences.FrontierConditions_GlobalTag_cff')
process.load('Geometry.TrackerGeometryBuilder.StackedTrackerGeometry_cfi')
process.load('IOMC.EventVertexGenerators.VtxSmearedGauss_cfi')

from Configuration.AlCa.GlobalTag import GlobalTag
process.GlobalTag = GlobalTag(process.GlobalTag, 'PH2_1K_FB_V3::All', '')

## pixel additions
process.load('Configuration.StandardSequences.RawToDigi_cff')
process.load('Configuration.StandardSequences.Reconstruction_cff')
process.load('SimGeneral.MixingModule.mixNoPU_cfi')

# customise for HT tracks

process.load('TMTrackTrigger.TMTrackFinder.TMTrackProducer_cff')
# process.load('TMTrackTrigger.TMTrackFinder.TTTrackAssociation_cfi')
import SimTracker.TrackTriggerAssociation.TTTrackAssociation_cfi
process.TMTTTrackAssociator = SimTracker.TrackTriggerAssociation.TTTrackAssociation_cfi.TTTrackAssociatorFromPixelDigis.clone(
 TTTracks = cms.VInputTag( cms.InputTag("TMTrackProducer", "TML1Tracks"),)
)
process.TTAssociator_step = cms.Path(process.TMTTTrackAssociator)

process.TMTrackProducer.StubCuts.BendResReduced = cms.bool(True)


############################################################
# options
############################################################
options = VarParsing.VarParsing('analysis')

options.register('inputMC', 'test_data.txt', VarParsing.VarParsing.multiplicity.singleton, VarParsing.VarParsing.varType.string, "Files to be processed")
options.register('Events',2,VarParsing.VarParsing.multiplicity.singleton, VarParsing.VarParsing.varType.int,"Number of Events to analyze (Default 100)")
options.outputFile = 'SingleMuon_noPU_TrkPerf.root'


############################################################
# input and output
############################################################

process.maxEvents = cms.untracked.PSet(input = cms.untracked.int32(options.Events))

list = FileUtils.loadListFromFile(options.inputMC)
Source_Files = cms.untracked.vstring(*list)
process.source = cms.Source("PoolSource", fileNames = Source_Files)

process.TFileService = cms.Service("TFileService", fileName = cms.string(options.outputFile), closeFileFast = cms.untracked.bool(True))


############################################################
# Path definitions & schedule
############################################################

#run the tracking
BeamSpotFromSim = cms.EDProducer("BeamSpotFromSimProducer")
#process.TTTracksFromPixelDigis.phiWindowSF = cms.untracked.double(2.0)  ## uncomment this to run with wider projection windows (for electrons)
process.TT_step = cms.Path(process.TMTrackProducer)
process.TTAssociator_step = cms.Path(process.TMTTTrackAssociator)


############################################################
# pixel stuff
############################################################

from RecoLocalTracker.SiPixelRecHits.SiPixelRecHits_cfi import *
process.siPixelRecHits = siPixelRecHits

process.L1PixelTrackFit = cms.EDProducer("L1PixelTrackFit")
process.pixTrk = cms.Path(process.L1PixelTrackFit)

process.pixRec = cms.Path(
    process.RawToDigi+
    process.siPixelRecHits
)
process.raw2digi_step = cms.Path(process.RawToDigi)


############################################################
# Define the track ntuple process, MyProcess is the (unsigned) PDGID corresponding to the process which is run
# e.g. single electron/positron = 11
#      single pion+/pion- = 211
#      single muon+/muon- = 13 
#      pions in jets = 6
#      taus = 15
#      all TPs = 1
############################################################

process.L1TrackJSON = cms.EDAnalyzer('L1TrackJSONMaker',
                                       MyProcess = cms.int32(13),
                                       DebugMode = cms.bool(False),      ## printout lots of debug statements
                                       SaveAllTracks = cms.bool(True),   ## save all L1 tracks, not just truth matched to primary particle
                                       DoPixelTrack = cms.bool(False),   ## save information for pixel tracks
                                       SaveStubs = cms.bool(True),      ## save some info for *all* stubs
                                       L1TrackInputTag = cms.InputTag("TMTrackProducer", "TML1Tracks"), ## TTTrack input
                                       MCTruthTrackInputTag = cms.InputTag("TMTTTrackAssociator", "TML1Tracks"), ## MCTruth input 
                                     Events = cms.int32(options.Events),
                                       )
process.ana = cms.Path(process.L1TrackJSON)

#output module (can use this to store edm-file instead of root-ntuple)
#process.out = cms.OutputModule( "PoolOutputModule",
#                                fileName = cms.untracked.string("FileOut.root"),
#                                fastCloning = cms.untracked.bool( False ),
#                                outputCommands = cms.untracked.vstring('drop *',
#                                                                       'keep *_*_Level1PixelTracks_*',
#                                                                       'keep *_*_Level1TTTracks_*',
#                                                                       'keep *_*_StubAccepted_*',
#                                                                       'keep *_*_ClusterAccepted_*',
#                                                                       'keep *_*_MergedTrackTruth_*')
#)
#process.FEVToutput_step = cms.EndPath(process.out)


# Automatic addition of the customisation function from SLHCUpgradeSimulations.Configuration.combinedCustoms
from SLHCUpgradeSimulations.Configuration.combinedCustoms import cust_2023TTI
process = cust_2023TTI(process)

#process.schedule = cms.Schedule(process.TT_step,process.TTAssociator_step,process.pixRec,process.pixTrk,process.FEVToutput_step)
#process.schedule = cms.Schedule(process.TT_step,process.TTAssociator_step,process.pixRec,process.pixTrk,process.ana)
process.schedule = cms.Schedule(process.TT_step,process.TTAssociator_step,process.ana)

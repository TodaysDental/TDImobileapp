import Foundation
import AmazonChimeSDK
import AVFoundation

@objc(ChimeSDKModule)
class ChimeSDKModule: RCTEventEmitter {
  
  private var meetingSession: MeetingSession?
  private var audioVideoFacade: AudioVideoFacade?
  private var currentMeetingId: String?
  private var currentAttendeeId: String?
  private var isCurrentlyMuted: Bool = false
  
  // Event constants
  private let ON_MEETING_START = "onMeetingStart"
  private let ON_MEETING_END = "onMeetingEnd"
  private let ON_ATTENDEE_JOIN = "onAttendeeJoin"
  private let ON_ATTENDEE_LEAVE = "onAttendeeLeave"
  private let ON_AUDIO_STATUS_CHANGED = "onAudioStatusChanged"
  private let ON_ERROR = "onError"
  private let ON_DEVICE_CHANGED = "onDeviceChanged"
  
  // Required for RCTEventEmitter
  override func supportedEvents() -> [String]! {
    return [
      ON_MEETING_START,
      ON_MEETING_END,
      ON_ATTENDEE_JOIN,
      ON_ATTENDEE_LEAVE,
      ON_AUDIO_STATUS_CHANGED,
      ON_ERROR,
      ON_DEVICE_CHANGED
    ]
  }
  
  // Required for React Native modules
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  // MARK: - Meeting Management
  
  @objc func createMeeting(_ meetingId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    // In a real implementation, this would typically call your server API to create a meeting
    // For now, we'll just simulate a successful response
    let meetingInfo: [String: Any] = [
      "MeetingId": meetingId,
      "MediaRegion": "us-east-1",
      "MediaPlacement": [
        "AudioHostUrl": "placeholder-audio-host-url",
        "SignalingUrl": "placeholder-signaling-url",
        "TurnControlUrl": "placeholder-turn-control-url"
      ]
    ]
    
    resolve(meetingInfo)
  }
  
  @objc func joinMeeting(_ meetingInfo: [String: Any], attendeeInfo: [String: Any], resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    // Convert meetingInfo to MeetingSessionConfiguration
    guard let meetingId = meetingInfo["MeetingId"] as? String,
          let attendeeId = attendeeInfo["AttendeeId"] as? String,
          let joinToken = attendeeInfo["JoinToken"] as? String else {
      reject("INVALID_PARAMS", "Invalid meeting or attendee info", nil)
      return
    }
    
    currentMeetingId = meetingId
    currentAttendeeId = attendeeId
    
    // Initialize the meeting session
    do {
      // Create meeting session
      let meetingSessionConfig = createMeetingSessionConfiguration(meetingInfo: meetingInfo, attendeeInfo: attendeeInfo)
      meetingSession = DefaultMeetingSession(configuration: meetingSessionConfig, logger: ConsoleLogger(name: "ChimeSDK"))
      audioVideoFacade = meetingSession?.audioVideo
      
      // Set up observers
      setupAudioVideoObservers()
      
      // Start the session
      try audioVideoFacade?.start()
      
      self.sendEvent(withName: self.ON_MEETING_START, body: ["meetingId": meetingId])
      resolve(true)
    } catch {
      reject("JOIN_MEETING_FAILED", "Failed to join meeting: \(error.localizedDescription)", error)
    }
  }
  
  @objc func leaveMeeting(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if let meetingId = currentMeetingId {
      audioVideoFacade?.stop()
      meetingSession = nil
      audioVideoFacade = nil
      
      self.sendEvent(withName: self.ON_MEETING_END, body: ["meetingId": meetingId])
      currentMeetingId = nil
      currentAttendeeId = nil
      resolve(true)
    } else {
      resolve(false) // No active meeting
    }
  }
  
  // MARK: - Audio Controls
  
  @objc func mute(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if audioVideoFacade != nil {
      audioVideoFacade?.realtimeLocalMute()
      isCurrentlyMuted = true
      self.sendEvent(withName: self.ON_AUDIO_STATUS_CHANGED, body: ["muted": true])
      resolve(true)
    } else {
      reject("NO_ACTIVE_SESSION", "No active meeting session", nil)
    }
  }
  
  @objc func unmute(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if audioVideoFacade != nil {
      audioVideoFacade?.realtimeLocalUnmute()
      isCurrentlyMuted = false
      self.sendEvent(withName: self.ON_AUDIO_STATUS_CHANGED, body: ["muted": false])
      resolve(true)
    } else {
      reject("NO_ACTIVE_SESSION", "No active meeting session", nil)
    }
  }
  
  @objc func isMuted(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if audioVideoFacade != nil {
      resolve(isCurrentlyMuted)
    } else {
      reject("NO_ACTIVE_SESSION", "No active meeting session", nil)
    }
  }
  
  // MARK: - Audio Device Management
  
  @objc func getAudioDevices(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if audioVideoFacade == nil {
      reject("NO_ACTIVE_SESSION", "No active meeting session", nil)
      return
    }
    
    let inputDevices: [[String: Any]] = [] // In iOS, we don't expose individual mic devices
    let outputDevices: [[String: Any]] = [
      ["deviceId": "receiver", "label": "Phone Receiver"],
      ["deviceId": "speaker", "label": "Phone Speaker"],
      ["deviceId": "bluetooth", "label": "Bluetooth Headset"],
      ["deviceId": "wired", "label": "Wired Headphones"]
    ] // These are the typical iOS audio routes
    
    let devices = [
      "inputDevices": inputDevices,
      "outputDevices": outputDevices
    ]
    
    resolve(devices)
  }
  
  @objc func setAudioInputDevice(_ deviceId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    // For iOS, this would configure the audio session as needed
    resolve(true)
  }
  
  @objc func setAudioOutputDevice(_ deviceId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let audioSession = AVAudioSession.sharedInstance() else {
      reject("AUDIO_SESSION_ERROR", "Failed to access AVAudioSession", nil)
      return
    }
    
    do {
      switch deviceId {
      case "speaker":
        try audioSession.overrideOutputAudioPort(.speaker)
      case "receiver":
        try audioSession.overrideOutputAudioPort(.none)
      default:
        // For bluetooth and wired headphones, iOS handles routing automatically
        break
      }
      
      self.sendEvent(withName: self.ON_DEVICE_CHANGED, body: ["outputDevice": deviceId])
      resolve(true)
    } catch {
      reject("AUDIO_ROUTE_ERROR", "Failed to set audio route: \(error.localizedDescription)", error)
    }
  }
  
  // MARK: - Audio Session Management
  
  @objc func startAudioSession(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      let audioSession = AVAudioSession.sharedInstance()
      try audioSession.setCategory(.playAndRecord, mode: .voiceChat, options: [.allowBluetooth, .allowBluetoothA2DP, .mixWithOthers])
      try audioSession.setActive(true)
      resolve(true)
    } catch {
      reject("AUDIO_SESSION_ERROR", "Failed to activate audio session: \(error.localizedDescription)", error)
    }
  }
  
  @objc func stopAudioSession(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      let audioSession = AVAudioSession.sharedInstance()
      try audioSession.setActive(false)
      resolve(true)
    } catch {
      reject("AUDIO_SESSION_ERROR", "Failed to deactivate audio session: \(error.localizedDescription)", error)
    }
  }
  
  // MARK: - Utility Functions
  
  @objc func unlockAudioFocus(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    // For iOS, this is similar to starting the audio session
    self.startAudioSession(resolve, rejecter: reject)
  }
  
  // MARK: - Helper Functions
  
  private func createMeetingSessionConfiguration(meetingInfo: [String: Any], attendeeInfo: [String: Any]) -> MeetingSessionConfiguration {
    // This is a placeholder function - in a real implementation, you would parse the meeting and attendee info
    // and create a proper MeetingSessionConfiguration object
    let meetingId = meetingInfo["MeetingId"] as! String
    let attendeeId = attendeeInfo["AttendeeId"] as! String
    let joinToken = attendeeInfo["JoinToken"] as! String
    
    // This is a placeholder and would not work in a real application
    // You would need to properly construct these objects from the provided info
    let createMeetingResponse = CreateMeetingResponse()
    let createAttendeeResponse = CreateAttendeeResponse()
    
    return MeetingSessionConfiguration(createMeetingResponse: createMeetingResponse,
                                       createAttendeeResponse: createAttendeeResponse)
  }
  
  private func setupAudioVideoObservers() {
    // In a real implementation, you would set up observers for various events
    // like attendee join/leave, audio status changes, etc.
  }
}

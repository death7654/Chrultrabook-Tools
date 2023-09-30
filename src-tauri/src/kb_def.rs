pub struct RemapCfgKey {
  pub MakeCode: u16,
  pub Flags: u16
}

pub enum RemapCfgOverride {
  RemapCfgOverrideAutoDetect,
  RemapCfgOverrideEnable,
  RemapCfgOverrideDisable
}

pub enum RemapCfgKeyState {
  RemapCfgKeyStateNoDetect,
  RemapCfgKeyStateEnforce,
  RemapCfgKeyStateEnforceNot
}

pub struct RemapCfg {
  pub LeftCtrl: RemapCfgKeyState,
  pub LeftAlt: RemapCfgKeyState,
  pub Search: RemapCfgKeyState,
  pub Assistant: RemapCfgKeyState,
  pub LeftShift: RemapCfgKeyState,
  pub RightCtrl: RemapCfgKeyState,
  pub RightAlt: RemapCfgKeyState,
  pub RightShift: RemapCfgKeyState,
  pub originalKey: RemapCfgKey,
  pub remapVivaldiToFnKeys: bool,
  pub remappedKey: RemapCfgKey,
  pub additionalKeys: [RemapCfgKey;8]
}

pub struct RemapCfgs {
  pub magic: u32,
  pub remappings: u32,
  pub FlipSearchAndAssistantOnPixelbook: bool,
  pub HasAssistantKey: RemapCfgOverride,
  pub IsNonChromeEC: RemapCfgOverride,
  pub cfg: [RemapCfg;1]
}

pub struct KeyStruct {
  pub MakeCode: u16,
  pub Flags: u16,
  pub InternalFlags: u16
}

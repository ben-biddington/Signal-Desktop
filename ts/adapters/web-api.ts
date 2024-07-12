import {
  initialize,
  type InitializeOptionsType,
  type WebAPIConnectOptionsType,
  type WebAPIConnectType,
  type WebAPIType,
} from '../textsecure/WebAPI';

export class WebApi implements WebAPIConnectType {
  private readonly options: InitializeOptionsType;

  constructor(options: InitializeOptionsType) {
    this.options = options;
  }

  connect = (connectOptions: WebAPIConnectOptionsType): WebAPIType => {
    return initialize(this.options).connect(connectOptions);
  };
}

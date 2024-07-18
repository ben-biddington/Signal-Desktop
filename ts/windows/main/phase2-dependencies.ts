// Copyright 2022 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import Backbone from 'backbone';
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as moment from 'moment';
import 'moment/min/locales.min';

import { textsecure } from '../../textsecure';
import * as Attachments from '../attachments';
import { setup } from '../../signal';
import { setup as mock } from '../../adapters/signal';
import { addSensitivePath } from '../../util/privacy';
import * as dns from '../../util/dns';
import * as log from '../../logging/log';
import { SignalContext } from '../context';
import { create } from '../../ports/DevNullTextSecure';
import { useDevNull } from '../../adapters';

// eslint-disable-next-line react-hooks/rules-of-hooks
window.useDevNull = useDevNull();

window.nodeSetImmediate = setImmediate;
window.Backbone = Backbone;
window.textsecure = window.useDevNull ? create() : textsecure();
/*
    [!] Forced to do this at the moment due to

    ```ts
      // ts/background.ts
      ourProfileKeyService.initialize(window.storage);
    ```

    The `Storage` ctor assigns window.storage so we'll do the same here 
    rather than have `DevNullStorage` do it.
*/
window.storage = window.textsecure.storage;

const { config } = window.SignalContext;

window.WebAPI = window.textsecure.WebAPI.initialize({
  url: config.serverUrl,
  storageUrl: config.storageUrl,
  updatesUrl: config.updatesUrl,
  resourcesUrl: config.resourcesUrl,
  directoryConfig: config.directoryConfig,
  cdnUrlObject: {
    0: config.cdnUrl0,
    2: config.cdnUrl2,
    3: config.cdnUrl3,
  },
  certificateAuthority: config.certificateAuthority,
  contentProxyUrl: config.contentProxyUrl,
  proxyUrl: config.proxyUrl,
  version: config.version,
  disableIPv6: config.disableIPv6,
});

window.libphonenumberInstance = PhoneNumberUtil.getInstance();
window.libphonenumberFormat = PhoneNumberFormat;

window.React = React;
window.ReactDOM = ReactDOM;

const { resolvedTranslationsLocale, preferredSystemLocales, localeOverride } =
  config;

moment.updateLocale(localeOverride ?? resolvedTranslationsLocale, {
  relativeTime: {
    s: window.i18n('icu:timestamp_s'),
    m: window.i18n('icu:timestamp_m'),
    h: window.i18n('icu:timestamp_h'),
  },
});
moment.locale(
  localeOverride != null ? [localeOverride] : preferredSystemLocales
);

const userDataPath = SignalContext.getPath('userData');
window.BasePaths = {
  attachments: Attachments.getPath(userDataPath),
  draft: Attachments.getDraftPath(userDataPath),
  stickers: Attachments.getStickersPath(userDataPath),
  temp: Attachments.getTempPath(userDataPath),
};

addSensitivePath(window.BasePaths.attachments);
if (config.crashDumpsPath) {
  addSensitivePath(config.crashDumpsPath);
}

if (SignalContext.config.disableIPv6) {
  dns.setIPv6Enabled(false);
}
dns.setFallback(SignalContext.config.dnsFallback);

window.Signal = (window.useDevNull ? mock : setup)({
  Attachments,
  getRegionCode: () => window.storage.get('regionCode'),
  logger: log,
  userDataPath,
});

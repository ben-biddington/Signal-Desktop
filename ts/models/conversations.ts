// Copyright 2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { has } from 'lodash';

import { Collection } from 'backbone';
import type { ConversationAttributesType } from '../model-types.d';
import { ConversationModel } from './conversation-model';

export { ConversationModel } from './conversation-model';

window.Whisper = window.Whisper || {};

window.Whisper.Conversation = ConversationModel;

window.Whisper.ConversationCollection = Collection.extend({
  model: window.Whisper.Conversation,

  /**
   * window.Backbone defines a `_byId` field. Here we set up additional `_byE164`,
   * `_byServiceId`, and `_byGroupId` fields so we can track conversations by more
   * than just their id.
   */
  initialize() {
    this.eraseLookups();
    this.on(
      'idUpdated',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (model: ConversationModel, idProp: string, oldValue: any) => {
        if (oldValue) {
          if (idProp === 'e164') {
            delete this._byE164[oldValue];
          }
          if (idProp === 'serviceId') {
            delete this._byServiceId[oldValue];
          }
          if (idProp === 'pni') {
            delete this._byPni[oldValue];
          }
          if (idProp === 'groupId') {
            delete this._byGroupId[oldValue];
          }
        }
        const e164 = model.get('e164');
        if (e164) {
          this._byE164[e164] = model;
        }
        const serviceId = model.getServiceId();
        if (serviceId) {
          this._byServiceId[serviceId] = model;
        }
        const pni = model.getPni();
        if (pni) {
          this._byPni[pni] = model;
        }
        const groupId = model.get('groupId');
        if (groupId) {
          this._byGroupId[groupId] = model;
        }
      }
    );
  },

  reset(models?: Array<ConversationModel>, options?: Backbone.Silenceable) {
    window.Backbone.Collection.prototype.reset.call(this, models, options);
    this.resetLookups();
  },

  resetLookups() {
    this.eraseLookups();
    this.generateLookups(this.models);
  },

  generateLookups(models: ReadonlyArray<ConversationModel>) {
    models.forEach(model => {
      const e164 = model.get('e164');
      if (e164) {
        const existing = this._byE164[e164];

        // Prefer the contact with both e164 and serviceId
        if (!existing || (existing && !existing.getServiceId())) {
          this._byE164[e164] = model;
        }
      }

      const serviceId = model.getServiceId();
      if (serviceId) {
        const existing = this._byServiceId[serviceId];

        // Prefer the contact with both e164 and seviceId
        if (!existing || (existing && !existing.get('e164'))) {
          this._byServiceId[serviceId] = model;
        }
      }

      const pni = model.getPni();
      if (pni) {
        const existing = this._byPni[pni];

        // Prefer the contact with both serviceId and pni
        if (!existing || (existing && !existing.getServiceId())) {
          this._byPni[pni] = model;
        }
      }

      const groupId = model.get('groupId');
      if (groupId) {
        this._byGroupId[groupId] = model;
      }
    });
  },

  eraseLookups() {
    this._byE164 = Object.create(null);
    this._byServiceId = Object.create(null);
    this._byPni = Object.create(null);
    this._byGroupId = Object.create(null);
  },

  add(
    data:
      | ConversationModel
      | ConversationAttributesType
      | Array<ConversationModel>
      | Array<ConversationAttributesType>
  ) {
    let hydratedData: Array<ConversationModel> | ConversationModel;

    // First, we need to ensure that the data we're working with is Conversation models
    if (Array.isArray(data)) {
      hydratedData = [];
      for (let i = 0, max = data.length; i < max; i += 1) {
        const item = data[i];

        // We create a new model if it's not already a model
        if (has(item, 'get')) {
          hydratedData.push(item as ConversationModel);
        } else {
          hydratedData.push(
            new window.Whisper.Conversation(item as ConversationAttributesType)
          );
        }
      }
    } else if (has(data, 'get')) {
      hydratedData = data as ConversationModel;
    } else {
      hydratedData = new window.Whisper.Conversation(
        data as ConversationAttributesType
      );
    }

    // Next, we update our lookups first to prevent infinite loops on the 'add' event
    this.generateLookups(
      Array.isArray(hydratedData) ? hydratedData : [hydratedData]
    );

    // Lastly, we fire off the add events related to this change
    // Go home Backbone, you're drunk.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.Backbone.Collection.prototype.add.call(this, hydratedData as any);

    return hydratedData;
  },

  /**
   * window.Backbone collections have a `_byId` field that `get` defers to. Here, we
   * override `get` to first access our custom `_byE164`, `_byServiceId`, and
   * `_byGroupId` functions, followed by falling back to the original
   * window.Backbone implementation.
   */
  get(id: string) {
    return (
      this._byE164[id] ||
      this._byE164[`+${id}`] ||
      this._byServiceId[id] ||
      this._byPni[id] ||
      this._byGroupId[id] ||
      window.Backbone.Collection.prototype.get.call(this, id)
    );
  },

  comparator(m: ConversationModel) {
    return -(m.get('active_at') || 0);
  },
});

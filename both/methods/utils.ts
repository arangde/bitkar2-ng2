/**
 * Created by andrew on 1/27/17.
 */
import { Match } from 'meteor/check';
import { EJSON } from 'meteor/ejson';

export function getSEOUrl(url) {
  return url.trim().replace(/[^a-zA-Z0-9-.]/g, "-").replace(/---/g, "-").replace(/--/g, "-").toLowerCase();
};

export function replacePropertyKey(json) {
  var str = EJSON.stringify(json);
  json = JSON.parse(str, function(key, value) {
    if(key == '$') {
      this._prop = value;
      delete this[key];
      return;
    }
    else {
      return value;
    }
  });

  return json;
};

export function getValueOfKey(params, keys) {
  var childParams = params;
  for (var i = 0; i < keys.length; i++) {
    if (Match.test(childParams[keys[i]], Match.Any) && childParams[keys[i]] != undefined) {
      childParams = childParams[keys[i]];
    }
    else {
      return null;
    }
  }
  return childParams;
};

export function removeHeadTags (html, stag, etag) {
  var pos = html.indexOf(stag);
  if(pos !== -1) {
    var pos2 = html.indexOf(etag);
    if(pos2 !== -1) {
      var subhtml = html.replace(html.substr(pos, pos2 + etag.length - pos), '');
      return removeHeadTags(subhtml, stag, etag);
    }
  }
  return html;
};

export function getEngineDisplay(engine) {
  var display = "";

  display += getEngineValue(engine.EngType);
  display += getEngineValue(engine.Liter);
  display += getEngineValue(engine.CC);
  display += getEngineValue(engine.CID);
  display += getEngineValue(engine.Fuel);
  display += getEngineValue(engine.FuelDel);
  display += getEngineValue(engine.Asp);
  display += getEngineValue(engine.EngVIN);
  display += getEngineValue(engine.EngDesg);

  return display;
};

function getEngineValue(engineValue) {
  return (engineValue && engineValue != '-' && engineValue != '--')? engineValue + " " : "";
};
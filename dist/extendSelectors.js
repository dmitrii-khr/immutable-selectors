'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = extendSelectorsTree;
exports.createSelectorForPath = createSelectorForPath;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function extendSelectorsTree(tree) {
  var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  // TODO noreplace option
  tree.flat = {};
  if (path.length > 0) {
    tree.root = {};
  }
  extendSelectorsNode(tree, path, tree, tree);
}

function createSelectorForPath(path) {
  var sel = getSelector.bind(null, path);
  extendSelector(sel, path);
  return sel;
}

function extendSelectorsNode(node) {
  var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var rootSelector = arguments[2];
  var nodeAsFunc = arguments[3];

  var keys = Object.keys(node);
  keys.forEach(function (key) {
    if (key !== 'flat' && key !== 'param') {
      var sel = node[key];
      var selAsGetFunc = void 0;
      if (typeof sel === 'function') {
        selAsGetFunc = sel;
      } else {
        var itemPath = void 0;
        if (sel.param) {
          if (path.indexOf('x') > 0) {
            console.warn('immutable-selector. Several parameters in hierarchy are not supported yet.');
          }
          itemPath = [].concat(_toConsumableArray(path), [key, sel.param]);
          selAsGetFunc = getSelectorWithParam.bind(null, itemPath);
        } else if (key === 'root') {
          itemPath = path;
        } else {
          itemPath = [].concat(_toConsumableArray(path), [key]);
        }
        if (!selAsGetFunc) {
          selAsGetFunc = getSelector.bind(null, itemPath);
        }

        extendSelectorsNode(sel, itemPath, rootSelector, selAsGetFunc);
        extendSelector(selAsGetFunc, itemPath, sel.param);
      }
      rootSelector.flat[key] = selAsGetFunc;
      nodeAsFunc[key] = selAsGetFunc;
    }
  });
}

function getSelectorWithParam(path, gState, x) {
  if (x) {
    var pathParam = path.slice(0);
    pathParam[path.indexOf('x')] = x;
    return gState.getIn(pathParam);
  } else {
    return gState.getIn(path.slice(0, path.length - 1));
  }
}

function getSelector(path, gState) {
  return gState.getIn(path);
}

function extendSelector(sel, pathFromRoot) {
  var pathWithParameter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  // sel.path = pathFromRoot;
  if (pathWithParameter) {
    sel.replace = replaceParam.bind(null, pathFromRoot);
  } else {
    sel.replace = replace.bind(null, pathFromRoot);
  }
}

function replace(path, gState, newValue) {
  return updateGState(gState, path, newValue);
}

function replaceParam(path, gState, newValue, x) {
  if (x) {
    var pathParam = path.slice(0);
    pathParam[path.indexOf('x')] = x;
    return updateGState(gState, pathParam, newValue);
  } else {
    return updateGState(gState, path.slice(0, path.length - 1), newValue);
  }
}

function updateGState(gState, path, value) {
  if (value == null) {
    return gState.deleteIn(path);
  } else {
    return gState.setIn(path, value);
  }
}
//# sourceMappingURL=extendSelectors.js.map
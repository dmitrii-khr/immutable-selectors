export default function extendSelectorsTree(tree, path = []) {
  // TODO noreplace option
  tree.flat = {};
  if (path.length > 0) {
    tree.root = {};
  }
  extendSelectorsNode(tree, path, tree, tree);
}

export function createSelectorForPath(path) {
  const sel = getSelector.bind(null, path);
  extendSelector(sel, path);
  return sel;
}

function extendSelectorsNode(node, path = [], rootSelector, nodeAsFunc) {
  const keys = Object.keys(node);
  keys.forEach((key) => {
    if (key !== 'flat' && key !== 'param') {
      const sel = node[key];
      let selAsGetFunc;
      if (typeof sel === 'function') {
        selAsGetFunc = sel;
      } else {
        let itemPath;
        if (sel.param) {
          if (path.indexOf('x') > 0) {
            console.warn('immutable-selector. Several parameters in hierarchy are not supported yet.');
          }
          itemPath = [...path, key, sel.param];
          selAsGetFunc = getSelectorWithParam.bind(null, itemPath);
        } else if (key === 'root') {
          itemPath = path;
        } else {
          itemPath = [...path, key];
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
    const pathParam = path.slice(0);
    pathParam[path.indexOf('x')] = x;
    return gState.getIn(pathParam);
  } else {
    return gState.getIn(path.slice(0, path.length - 1));
  }
}

function getSelector(path, gState) {
  return gState.getIn(path);
}

function extendSelector(sel, pathFromRoot, pathWithParameter = false) {
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
    const pathParam = path.slice(0);
    pathParam[path.indexOf('x')] = x;
    return updateGState(gState, pathParam, newValue);
  } else {
    return  updateGState(gState, path.slice(0, path.length - 1), newValue);
  }
}

function updateGState(gState, path, value) {
  if (value == null) {
    return gState.deleteIn(path);
  } else {
    return gState.setIn(path, value);
  }
}


# immutable-selectors
![travis build status](https://travis-ci.org/dmitrii-khr/immutable-selectors.svg?branch=master)

This package is used for comfort reusable access to parts of deep nested immutable structures. It also allows you to make modification of this structures.
## Usage
**Example immutable structure**
```javascript
const state = Immutable.fromJS({
  moduleA: {
    foo: {
      id:100500,
      deep:{
        val:500
      },
      message:'SomeStringMessage'
    },
    bar:{}
  },
  moduleB:{}
});
```
**Create selector tree**
Describe nested selector - object with properties you want to get access:
```javascript
    const selectors = {
      foo:{
        deep:{val:{}},
        message:{}
      }
    }
```
Make selectors from this object:
```javascript
import extendSelecors from 'immutable-selectors';
extendSelecors(selectors, ['moduleA']);
```
*extendSelecors(selectorsTree, [path])* function recursively converts each key in object to a function(state), which returns corresponding part of immutable structure. At the same time, it saves the hierarchy. It is not returns a new selector - object, but it converts selectors object itself. This allows to use intelliSence in most of IDEs.

**Use selector**
```javascript
console.log(selectors.foo.message(state)); //SomeStringMessage
console.log(selectors.foo(state)); // Map { "id": 100500, "deep": Map { "val": 500 }, "message": "SomeStringMessage" }
console.log(selectors.foo(state).get('message')); // SomeStringMessage
console.log(selectors.foo.deep.val(state)); // 500
```

*flat option:*
Each unique key of selectors-tree is dublicated in *selectors.flat* object:
```javascript
console.log(selectors.flat.val(state)); //500
console.log(selectors.flat.message(state)); // SomeStringMessage
```
*root option:*
```javascript
const moduleAData = selectors.root(state);
console.log(moduleAData.getIn(['foo', 'id'])); //100500
```

**Modifications**
Each selector-function in tree has *replace(state, newValue)* child function, which returns new immutable structure with changed corresponding part.
```javascript
var newState = selectors.foo.message.replace(state, 'updated message');
console.log(newState.getIn(['moduleA','foo', 'message'])); //updated message
```
```javascript
var newState = selectors.flat.val.replace(state, 'new value');
console.log(newState.getIn(['moduleA','foo', 'deep', 'val'])); //new value
```
```javascript
var part = selectors.foo(state).asMutable();
part.setIn(['deep', 'val'], 'fivehundred');
var newState = selectors.foo.replace(state, part.asImmutable());
console.log(newState.getIn(['moduleA','foo', 'deep', 'val']));//fivehundred
```

## Parameters
It is possible to use selectors for collection items access (Lists and Maps). You should specify **param** property in selector-object at collection level.

**Example immutable structure**
```javascript
const state = Immutable.fromJS({
  moduleA: {
    bar: {
      listItems: [
        {
          key: 100,
          caption: 'firstListItem',
          deep:{ description:'someText'}
        },
        {
          key: 200,
          caption: 'secondLIstItem'
        }
      ]}}
});
```
**Create selector tree**
```javascript
    const selectors = {
        bar:{
          listItems:{
            param:'x',
            key:{},
            caption:{},
            deep:{description:{}}
          }
        }
    }

   extendSelecors(selectors, ['moduleA']);
   ```

**Use**
```javascript
  console.log(selectors.bar.listItems.caption(state, '1')); //secondLIstItem
  console.log(selectors.flat.key(state, '0')); //100
  console.log(selectors.flat.description(state, '0')); //someText
  console.log(selectors.bar.listItems(state, '1'));//Map { "key": 200, "caption": "secondLIstItem" }
  console.log(selectors.bar.listItems(state));//List [ Map { "key": 100, "caption":...

   ```

**Modifications**
Use third parameter of replace function to specify collection item.
```javascript
var newState = selectors.bar.listItems.caption.replace(state, 'updated-first', '0');
console.log(newState.getIn(['moduleA', 'bar', 'listItems', '0', 'caption'])); // updated-first
 ```

## Use with redux
One of use-cases is to replace redux reducers with action-creators, which generates new global state.
Example of action-creator:
```javascript
export function showMessage(message) {
  return function (dispatch, getState) {
    dispatch({
      type: 'show message',
      setState: selectors.message.replace(getState(), message)
    });
  };
}
 ```
Root reducer:
```javascript
function setStateReducer(state = initialState, action) {
  if (action.setState) {
    return action.setState;
  } else {
    return state;
    // return combinedReducers(state, action);  // You can mix this pattern with classical combineReducers - function.
  }
}
 ```
[Example](https://github.com/dmitrii-khr/selectorsTreeExample) of using **immutable-selectors** with redux without redusers.

import {assert}  from 'chai';
import state from './example';
import extendSelecors from '../src/extendSelectors';
import Immutable from 'immutable';

describe('extendSelectors', ()=>{
  describe('data access no parameters', ()=>{

// prepare selectors
    const selectors = {
      foo:{
        id:{},
        deep:{val:{}},
        message:{}
      }
    }

    extendSelecors(selectors, ['moduleA']);

//test
    it('first level value',()=> {

      assert.equal(selectors.foo.id(state), 100500);
      assert.equal(selectors.foo.message(state), 'SomeStringMessage');
    });

    it('flat property', ()=>{
      assert.equal(selectors.flat.id(state), 100500);
      assert.equal(selectors.flat.message(state), 'SomeStringMessage');
    });

    it('root property', ()=>{
      assert.equal(selectors.root(state).getIn(['foo','id']), 100500);
    });

    it('deep nested value ', ()=>{
      assert.equal(selectors.foo.deep.val(state), 500);
      assert.equal(selectors.flat.val(state), 500);
    });


  });
  describe('data access with parameters', ()=>{

// prepare selectors
    const selectors = {
      moduleA:{
        bar:{
          mapItems:{
            param:'x',
            key:{},
            caption:{},
            baz:{
              description:{}
            }
          }
        }
      }
    }

    extendSelecors(selectors);

    it('map-items collection',()=> {
      assert.equal(selectors.moduleA.bar.mapItems(state).getIn(['101', 'key']), 1001);
    });


    it('map-items item ',()=> {
      assert.equal(selectors.moduleA.bar.mapItems(state, '101').get('key'), 1001);

    });

    it('map-items item attribute',()=> {
      assert.equal(selectors.moduleA.bar.mapItems.caption(state, '101'), 'firstMapItem');
    });

    it('map-items 2nditem attribute',()=> {
      assert.equal(selectors.moduleA.bar.mapItems.caption(state, '201'), 'secondMapItem');
    });

    it('nested in item property',()=> {
      assert.equal(selectors.flat.description(state, '101'), 'someText');
    });


  })


  describe('replace no parameters', ()=>{

// prepare selectors
    const selectors = {
      foo:{
        id:{},
        deep:{val:{}},
        message:{}
      }
    }

    extendSelecors(selectors, ['moduleA']);

//test
    it('first level replace',()=> {
      var newState = selectors.foo.id.replace(state, 'updated');
      assert.equal(newState.getIn(['moduleA','foo', 'id']), 'updated');
    });

    it('flat replace',()=> {
      var newState = selectors.flat.message.replace(state, 'updated message');
      assert.equal(newState.getIn(['moduleA','foo', 'message']), 'updated message');
    });

    it('state part replace',()=> {
      var part = selectors.foo(state).asMutable();
      part.setIn(['deep', 'val'], 'fivehundred');
      var newState = selectors.foo.replace(state, part.asImmutable());
      assert.equal(newState.getIn(['moduleA','foo', 'deep', 'val']), 'fivehundred');
    });

    it('delete',()=> {
      var newState = selectors.foo.id.replace(state,null);

      assert.isFalse(newState.hasIn(['moduleA','foo', 'id']), 'fivehundred');
    });
  });

  describe('replace with parameters', ()=>{

// prepare selectors
    const selectors = {
        bar:{
          listItems:{
            param:'x',
            key:{},
            caption:{},
          }
        }
    }

    extendSelecors(selectors, ['moduleA']);

    it('item property replace',()=> {

      var newState = selectors.bar.listItems.caption.replace(state, 'updated-first', '0');
      assert.equal(newState.getIn(['moduleA', 'bar', 'listItems', '0', 'caption']), 'updated-first');
    });

    it('collection replace',()=> {
      var newState = selectors.bar.listItems.replace(state, Immutable.fromJS([{key:200}]));
      assert.equal(newState.getIn(['moduleA', 'bar', 'listItems', '0', 'key']), 200);
    });

    it('collection item replace',()=> {
      var newState = selectors.bar.listItems.replace(state, Immutable.fromJS({key:222}), '1');
      assert.equal(newState.getIn(['moduleA', 'bar', 'listItems', '0', 'key']), 100);
      assert.equal(newState.getIn(['moduleA', 'bar', 'listItems', '1', 'key']), 222);
    });

  })
})

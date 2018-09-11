import Immutable from 'immutable';

const state = Immutable.fromJS({
  moduleA: {
    foo: {
      id:100500,
      deep:{
        val:500
      },
      message:'SomeStringMessage'
    },
    bar: {
      listItems: [
        {
          key: 100,
          caption: 'firstListItem'
        },
        {
          key: 200,
          caption: 'secondLIstItem'
        }
      ],
      mapItems:{
        '101':{
          key:1001,
          caption:'firstMapItem',
          baz:{
            description:'someText'
          }
        },
        '201':{
          key:2001,
          caption:'secondMapItem'
        }
    }
  },
  moduleB: {}
}});

export default state;

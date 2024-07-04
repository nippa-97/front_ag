const arrayMoveMutate = (array, from, to) => {
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
};
// #MP-CAT-08
const arrayMove = (array, from, to) => {
  array = array.slice();
  arrayMoveMutate(array, from, to);
  
  for (let i = 0; i < array.length; i++) {
    array[i]["rank"] = (i+1);
  }

  return array;
};

export default arrayMove;
  
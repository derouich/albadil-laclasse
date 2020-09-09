export function removeDuplicates(originalArray, prop) {
     var newArray = [];
     var lookupObject  = {};

     for(var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
     }

     for(i in lookupObject) {
         newArray.push(lookupObject[i]);
     }
      return newArray;
 }


export function addLabelForSelectorClasse(originalArray){
	originalArray.map(obj =>{
              obj['label']=obj.classeName;
              obj['id']=obj.id;
              obj['value']=obj.classeName;

    });
    return originalArray;
}


export function buildListForCalendar(originalArray){
  originalArray.map(obj =>{
              obj['color']=obj.isActive ? "#000b99" : "#000b99" ;
              obj['desc']=obj.description;
              obj['end']=obj.endDateTime;
              obj['id']=obj.id;
              obj['start']=obj.startDateTime;
              obj['title']=obj.roomName;
              obj['classe']=obj.classe;
              obj['value']=obj.id;

    });
    return originalArray;
}



export function checkIfCurrentClasseExist(currentClasseId , originalArray){
    let elementExist = false ;
    originalArray.map(obj =>{
              if(obj._id == currentClasseId){
                elementExist = true ;
              }
    });
    return elementExist;
}

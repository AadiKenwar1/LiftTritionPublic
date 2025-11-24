import "react-native-reanimated"; // top of file
import { useState } from "react";
import { View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import Log from "./Log";

export default function DraggableLogList(props) {
  const [listKey, setListKey] = useState(0);

  return (
    <DraggableFlatList
      data={props.data}
      key={listKey}
      keyExtractor={(item) => item.id.toString()}
      onDragEnd={({ data }) => {
        props.reorderWorkouts
          ? props.reorderWorkouts(data)
          : props.reorderExercises(props.workout.id, data);
        setListKey((prev) => prev + 1);
      }}
      ListHeaderComponent={props.ListHeaderComponent}
      contentContainerStyle={{ paddingBottom: 100 }}
      activationDistance={20}
      showsVerticalScrollIndicator={false}
      //extraData={{ moveMode: props.moveMode, data: props.data }}
      //removeClippedSubviews={false}

      renderItem={({ item, drag, isActive }) => {
        return (
          <View style={{ marginBottom: 12, paddingHorizontal: 20 }}>
            <Log
              bold={props.bold}
              currItem={item}
              isActive={isActive}
              archived={item.archived}
              function={() => props.function2(item)}
              drag={drag} // ✅ Only drag in moveMode
              moveMode={props.moveMode}
              onMenuPress={() => {
                props.reorderWorkouts
                  ? props.onMenuPress(item)
                  : props.onMenuPress(props.workout, item);
              }} // ✅ Menu button
            />
          </View>
        );
      }}
      renderPlaceholder={() => (
        <View style={{ marginBottom: 16, paddingHorizontal: 20 }}>
          <View
            style={{
              backgroundColor: "#1A1A1A",
              height: 72,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          />
        </View>
      )}
    />
  );
}

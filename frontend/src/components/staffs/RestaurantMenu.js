import React, { useState, useEffect, useContext } from "react";
import {
  Item,
  Button,
  Message,
  Segment,
  Form,
  Input,
  Label,
  Loader,
} from "semantic-ui-react";
import FoodItemEditor from "./FoodItemEditor";
import NewItemButton from "./NewItemButton";
import Axios from "axios";
import UserContext from "utils/UserContext";
import ItemHistoryViewer from "./ItemHistoryViewer";

function RestaurantMenu() {
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantFoodItems, setRestaurantFoodItems] = useState([]);
  const [saveChanges, setSaveChanges] = useState(false);
  const [minAmt, setMinAmt] = useState(0);
  const [loading, setLoading] = useState(true);
  const { uid } = useContext(UserContext);

  useEffect(() => {
    fetchData();
  }, []);

  const updateFoodItem = (key, value, index) => {
    let clone = [...restaurantFoodItems];
    let affectedItem = clone[index];
    let itemClone = {
      name: affectedItem.name,
      price: affectedItem.price,
      category: affectedItem.category,
      limit: affectedItem.limit,
      imgurl: affectedItem.imgurl,
      fid: affectedItem.fid,
      avail: affectedItem.avail,
    };
    itemClone[key] = value;
    clone[index] = itemClone;
    setRestaurantFoodItems(clone);
  };

  const fetchData = () => {
    setLoading(true);
    const url = `http://localhost:5000/api/staffs/${uid}`;
    Axios.get(url)
      .then((response) => {
        let rname = response.data.rname;
        setRestaurantName(rname);
        const url2 = `http://localhost:5000/api/restaurants/${rname}/menu`;
        Axios.get(url2)
          .then((response) => {
            let minamt = response.data.minamt;
            let menu = response.data.menu;
            setRestaurantFoodItems(menu);
            setMinAmt(minamt);
            setLoading(false);
          })
          .catch((error) => {
            console.log("Error fetching staff menu data", error);
          });
      })
      .catch((error) => {
        console.log("Error fetching staff restaurant", error);
      });
  };

  // const deleteFoodItem = (index) => {
  const deleteFoodItem = (name) => {
    console.log("Delete this item:", name);
    const url = `http://localhost:5000/api/restaurants/${restaurantName}/menu`;
    Axios.delete(url, { data: { fname: `'${name}'` } })
      .then((response) => {
        console.log("Deleted item from menu:", response.data);
        fetchData();
      })
      .catch((error) => {
        console.log("Error occurred deleting item from menu", error);
      });
    //let clone = [...restaurantFoodItems];
    //clone.splice(index, 1);
    //setRestaurantFoodItems(clone);
  };

  const createFoodItem = (foodItem) => {
    const url = `http://localhost:5000/api/restaurants/${restaurantName}/menu`;
    console.log(foodItem);
    Axios.post(url, foodItem)
      .then((response) => {
        console.log(response);
        console.log("Item successfully added to the menu");
        fetchData();
      })
      .catch(({ response }) => {
        console.log("An error occured while adding new item to the menu");
        alert(response.data.msg);
      });
    //setRestaurantFoodItems([foodItem].concat(restaurantFoodItems));
  };

  const handleSaveChanges = () => {
    // API call to patch new changes
    let updatedData = {
      updatedMenu: restaurantFoodItems,
      minamt: minAmt,
    };

    const url = `http://localhost:5000/api/restaurants/${restaurantName}/menu`;
    Axios.put(url, updatedData)
      .then((response) => {
        console.log(response.data);
        // if success
        setSaveChanges(true);
        fetchData();
      })
      .catch(({ response }) => {
        if (response.status === 400) {
          alert("Error updating menu: " + response.data.msg);
        }
        return;
      });
  };

  return (
    <>
      {saveChanges && (
        <Message
          success
          header="Success"
          content="Food items are updated successfully"
          style={{ textAlign: "center" }}
        />
      )}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>{loading ? <Loader inline active /> : restaurantName}</h1>
        <span>
          <Button color="blue" onClick={handleSaveChanges}>
            Save changes
          </Button>
          <NewItemButton createFoodItem={createFoodItem} />
        </span>
      </div>

      <Form>
        <Form.Field inline>
          <label>Min order amount</label>
          <Input
            type="number"
            label={<Label basic>$</Label>}
            labelPosition="left"
            value={minAmt}
            size="mini"
            onChange={(event, data) => {
              let newMinAmt = Number(Number(data.value).toFixed(2));
              setMinAmt(newMinAmt);
            }}
            disabled={loading}
            loading={loading}
          />
        </Form.Field>
      </Form>

      {loading ? (
        <Segment
          size="massive"
          basic
          placeholder
          textAlign="center"
          loading={loading}
        />
      ) : (
        <Item.Group divided>
          {restaurantFoodItems.map((value, index) => {
            return (
              <FoodItemEditor
                key={index}
                index={index}
                name={value.name}
                price={value.price}
                category={value.category}
                limit={value.limit}
                imgurl={value.imgurl}
                avail={value.avail}
                history={value.history}
                updateFoodItem={updateFoodItem}
                deleteFoodItem={deleteFoodItem}
                isEditor
              />
            );
          })}
        </Item.Group>
      )}
    </>
  );
}

export default RestaurantMenu;

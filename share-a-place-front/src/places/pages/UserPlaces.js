import React from 'react';

import PlaceList from '../components/PlaceList';

const DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    imageUrl: 'https://www.voyageavecnous.fr/wp-content/uploads/2019/10/visiter-empire-state-building.jpg',
    address: '20 W 34th St, New York, NY 10001',
    location: {
      lat: 40.7484405,
      lng: -73.9878584
    },
    creator: 'u1'
  },

  {
    id: 'p2',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    imageUrl: 'https://www.voyageavecnous.fr/wp-content/uploads/2019/10/visiter-empire-state-building.jpg',
    address: '20 W 34th St, New York, NY 10001',
    location: {
      lat: 40.7484405,
      lng: -73.9878584
    },
    creator: 'u2'
  }
]

const UserPlaces = () => {
  const creatorPlaces = DUMMY_PLACES.filter((place) => (place.creator === 'u1'));


  return (
    <PlaceList items={creatorPlaces} />
  )
};

export default UserPlaces;
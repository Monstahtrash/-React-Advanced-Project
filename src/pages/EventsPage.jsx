import React, { useEffect, useState } from 'react';
import { Box, Icon, Heading, VStack, Text, Image, SimpleGrid, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, Textarea, FormControl, FormLabel, Select, useDisclosure } from '@chakra-ui/react';
import { FaUpload } from "react-icons/fa";

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); 
  const [filteredEvents, setFilteredEvents] = useState([]); 

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    categoryIds: [],
    createdBy: '', 
    location: '',
    image: null,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    FetchEvents();
    FetchCategories();
  }, []);

  useEffect(() => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((event) => {
        return event.categoryIds.includes(parseInt(selectedCategory));
      });
    }

    setFilteredEvents(filtered);
  }, [searchQuery, selectedCategory, events]); 

  async function FetchEvents() {
    try {
      const result = await fetch('http://localhost:3000/events');
      
      if (!result.ok) {
        throw new Error(`Error: ${result.status} ${result.statusText}`);
      }

      const resultData = await result.json();
      setEvents(resultData);
    } catch (error) {
      console.error("Failed to fetch:", error.message);
    }
  }

  async function FetchCategories() {
    try {
    const result = await fetch('http://localhost:3000/categories');
    
    if (!result.ok) {
      throw new Error(`Error: ${result.status} ${result.statusText}`);
    }

    const resultData = await result.json();
    setCategories(resultData);
  } catch (error) {
    console.error("Failed to fetch:", error.message);
  }
  }

  const onEventClick = (id) => {
    window.location.href = '/event/' + id;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value
    }));
  };

  const handleCategoryChange = (e) => {
    const { options } = e.target;
    const selectedCategories = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedCategories.push(options[i].value);
      }
    }
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      categoryIds: selectedCategories
    }));
  };

  const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const imageURL = URL.createObjectURL(file);
        setNewEvent((prevEvent) => ({
          ...prevEvent,
          ['image']: imageURL
        }));
      }
  };

  const handleSubmit = async () => {
    if(newEvent.title == '' || newEvent.description == '' || newEvent.startTime == '' || newEvent.endTime == '' || newEvent.createdBy == '' || newEvent.location == ''){
      alert('Please fill in all the required fields!');
    } else{
        const newUser = await handleNewUser(newEvent.createdBy);
        newEvent.createdBy = newUser.id;
        const response = await fetch('http://localhost:3000/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newEvent),
        });

        if (response.ok) {
          FetchEvents(); 
          onClose(); 
          setNewEvent({
            title: '',
            description: '',
            startTime: '',
            endTime: '',
            categoryIds: [],
            createdBy: '',
            location: '',
            image: null,
          }); 
        } else {
          alert('Error adding event');
        }
      }
  };

  async function handleNewUser(user){
    const response = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({name: user}),
    });
    if (response.ok) {
      const responseData = await response.json();
      console.log(responseData);
      return responseData;
    }
   
    
  }

  return (
    <Box p={6} w="100%">
      <Heading as="h1" size="xl" mb={6} textAlign="center">
        List of Events
      </Heading>
      <FormControl mb={6}>
        <FormLabel htmlFor="search" fontSize="lg">
          Search Events
        </FormLabel>
        <Input
          id="search"
          placeholder="Search by event title or description"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
      </FormControl>
      <FormControl mb={6}>
        <FormLabel htmlFor="category-filter" fontSize="lg">
          Filter by Category
        </FormLabel>
        <Select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)} 
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </FormControl>
      <Button colorScheme="teal" mb={6} onClick={onOpen}>
        Add Event
      </Button>
      {filteredEvents.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredEvents.map((event, index) => (
            <Box
              key={index}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg="gray.50"
              boxShadow="md"
              _hover={{ transform: 'scale(1.02)', transition: 'transform 0.2s' }}
              onClick={() => {
                onEventClick(event.id);
              }}
            >
              <VStack align="start" spacing={3}>
                <Text fontSize="lg" fontWeight="bold">
                  {event.title}
                </Text>
                <Text>{event.description}</Text>
                <Image
                  src={event.image}
                  alt={event.title}
                  borderRadius="md"
                  objectFit="cover"
                  boxSize="200px"
                />
                <Text>
                  <strong>Start Time:</strong> {event.startTime}
                </Text>
                <Text>
                  <strong>End Time:</strong> {event.endTime}
                </Text>
                <Box>
                  <strong>Categories:</strong>{' '}
                  {event.categoryIds.map((categoryId, index) => {
                    const category = categories.find(category => category.id == categoryId);
                    return category ? (
                      <Text as="span" key={index}>
                        {category.name}
                        {index < event.categoryIds.length - 1 ? ', ' : ''}
                      </Text>
                    ) : (
                      <Text as="span" key={index} color="red.500">
                        Category not found
                      </Text>
                    );
                  })}
                </Box>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Text textAlign="center" color="gray.500">
          No events available.
        </Text>
      )}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add a New Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  name="title"
                  value={newEvent.title}
                  onChange={handleFormChange}
                  placeholder="Event title"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={newEvent.description}
                  onChange={handleFormChange}
                  placeholder="Event description"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Start Time</FormLabel>
                <Input
                  name="startTime"
                  type="datetime-local"
                  value={newEvent.startTime}
                  onChange={handleFormChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>End Time</FormLabel>
                <Input
                  name="endTime"
                  type="datetime-local"
                  value={newEvent.endTime}
                  onChange={handleFormChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Categories</FormLabel>
                <Select
                  multiple
                  value={newEvent.categoryIds}
                  onChange={handleCategoryChange}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Created by</FormLabel>
                <Input
                  name="createdBy"
                  value={newEvent.createdBy}
                  onChange={handleFormChange}
                  placeholder="Created by"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Location</FormLabel>
                <Input
                  name="location"
                  value={newEvent.location}
                  onChange={handleFormChange}
                  placeholder="Location"
                />
              </FormControl>
              <FormControl>
              <FormLabel>Upload Image</FormLabel>
                <Button
                  as="label"
                  htmlFor="image-upload"
                  leftIcon={<Icon as={FaUpload} />}
                  colorScheme="teal"
                  variant="solid"
                  cursor="pointer"
                >
                  Upload Image
                </Button>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleSubmit}>
              Add Event
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

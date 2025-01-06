import React, { useEffect, useState } from 'react';
import { Box, Heading, VStack, Text, Image, SimpleGrid, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, Textarea, FormControl, FormLabel, Select, useDisclosure } from '@chakra-ui/react';

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // For storing the search query
  const [selectedCategory, setSelectedCategory] = useState(''); // For storing the selected category
  const [filteredEvents, setFilteredEvents] = useState([]); // To store filtered events based on search and category

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    categoryIds: []
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    FetchEvents();
    FetchCategories();
  }, []);

  useEffect(() => {
    // Filter events based on search query and selected category
    let filtered = events;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((event) => {
        return event.categoryIds.includes(parseInt(selectedCategory));
      });
    }
    console.log(filtered);
    console.log(selectedCategory);
    setFilteredEvents(filtered);
  }, [searchQuery, selectedCategory, events]); // Re-filter when search query, selected category, or events change

  async function FetchEvents() {
    const result = await fetch('http://localhost:3000/events');
    const resultData = await result.json();
    setEvents(resultData);
  }

  async function FetchCategories() {
    const result = await fetch('http://localhost:3000/categories');
    const resultData = await result.json();
    setCategories(resultData);
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

  const handleSubmit = async () => {
    const response = await fetch('http://localhost:3000/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEvent),
    });

    if (response.ok) {
      FetchEvents(); // Refresh events list after adding the new event
      onClose(); // Close the modal
      setNewEvent({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        categoryIds: []
      }); // Reset the form
    } else {
      alert('Error adding event');
    }
  };

  return (
    <Box p={6} w="100%">
      <Heading as="h1" size="xl" mb={6} textAlign="center">
        List of Events
      </Heading>

      {/* Search Input */}
      <FormControl mb={6}>
        <FormLabel htmlFor="search" fontSize="lg">
          Search Events
        </FormLabel>
        <Input
          id="search"
          placeholder="Search by event title or description"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query
        />
      </FormControl>

      {/* Category Filter Dropdown */}
      <FormControl mb={6}>
        <FormLabel htmlFor="category-filter" fontSize="lg">
          Filter by Category
        </FormLabel>
        <Select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)} // Update selected category
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </FormControl>

      {/* Add Event Button */}
      <Button colorScheme="teal" mb={6} onClick={onOpen}>
        Add Event
      </Button>

      {/* Displaying Filtered Events */}
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
                <Text>
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
                </Text>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Text textAlign="center" color="gray.500">
          No events available.
        </Text>
      )}

      {/* Add Event Modal */}
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







// import React, { useEffect, useState } from 'react';
// import { Box, Heading, VStack, Text, Image, SimpleGrid, Input, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, FormControl, FormLabel, Input as ChakraInput, ModalFooter, Select, CheckboxGroup, Checkbox } from '@chakra-ui/react';

// export const EventsPage = () => {
//   const [events, setEvents] = useState([]);
//   const [searchQuery, setSearchQuery] = useState(''); // Search query state
//   const [filteredEvents, setFilteredEvents] = useState([]); // Filtered events state
//   const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for Add Event
//   const [newEvent, setNewEvent] = useState({ title: '', description: '', image: '', startTime: '', endTime: '', categories: '' }); // Form state for new event
//   const [categories, setCategories] = useState([]); // List of all available categories for filtering
//   const [selectedCategories, setSelectedCategories] = useState([]); // Selected categories for filtering

//   useEffect(() => {
//     FetchEvents();
//   }, []);

//   useEffect(() => {
//     if (events.length > 0) {
//       handleSearch(searchQuery); // Filter events when the search query changes
//     }
//   }, [searchQuery, events]);

//   useEffect(() => {
//     if (events.length > 0 && selectedCategories.length > 0) {
//       filterByCategories(selectedCategories);
//     } else {
//       setFilteredEvents(events); // Show all events if no categories are selected
//     }
//   }, [selectedCategories]);

//   async function FetchEvents() {
//     const result = await fetch('http://localhost:3000/events');
//     const resultData = await result.json();
//     setEvents(resultData);
//     setFilteredEvents(resultData); // Initially show all events

//     // Extract all categories from the events for the filter
//     const allCategories = [...new Set(resultData.flatMap(event => event.categories))];
//     setCategories(allCategories);
//   }

//   const handleSearch = (query) => {
//     const lowerCaseQuery = query.toLowerCase();
//     const filtered = events.filter(
//       (event) =>
//         event.title.toLowerCase().includes(lowerCaseQuery) ||
//         event.description.toLowerCase().includes(lowerCaseQuery)
//     );
//     setFilteredEvents(filtered);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewEvent((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async () => {
//     try {
//       const response = await fetch('http://localhost:3000/events', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ...newEvent,
//           categories: newEvent.categories.split(',').map((cat) => cat.trim()), // Ensure categories are an array
//         }),
//       });
//       if (response.ok) {
//         const newEventData = await response.json();
//         setEvents((prevEvents) => [...prevEvents, newEventData]); // Update UI with the new event
//         setFilteredEvents((prevEvents) => [...prevEvents, newEventData]);
//         setNewEvent({ title: '', description: '', image: '', startTime: '', endTime: '', categories: '' }); // Reset form data
//         setIsModalOpen(false); // Close the modal
//       } else {
//         console.error('Failed to add event.');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const onEventClick = (id) => {
//     window.location.href = '/event/' + id;
//   };

//   const filterByCategories = (selectedCategories) => {
//     const filtered = events.filter(event =>
//       selectedCategories.every(category => event.categories.includes(category))
//     );
//     setFilteredEvents(filtered);
//   };

//   return (
//     <Box p={6} w="100%">
//       <Heading as="h1" size="xl" mb={6} textAlign="center">
//         List of Events
//       </Heading>

//       {/* Search Bar */}
//       <Box mb={6} textAlign="center">
//         <Input
//           placeholder="Search events..."
//           size="md"
//           maxWidth="400px"
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//       </Box>

//       {/* Filter Categories */}
//       <Box mb={6} textAlign="center">
//         <CheckboxGroup value={selectedCategories} onChange={setSelectedCategories}>
//           <FormControl>
//             <FormLabel>Filter by Categories</FormLabel>
//             <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
//               {categories.map((category, index) => (
//                 <Checkbox key={index} value={category}>
//                   {category}
//                 </Checkbox>
//               ))}
//             </SimpleGrid>
//           </FormControl>
//         </CheckboxGroup>
//       </Box>

//       {/* Add Event Button */}
//       <Box mb={6} textAlign="center">
//         <Button colorScheme="teal" onClick={() => setIsModalOpen(true)}>
//           Add Event
//         </Button>
//       </Box>

//       {/* Modal for Adding Event */}
//       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Add New Event</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <FormControl mb={3}>
//               <FormLabel>Title</FormLabel>
//               <ChakraInput
//                 name="title"
//                 value={newEvent.title}
//                 onChange={handleInputChange}
//               />
//             </FormControl>
//             <FormControl mb={3}>
//               <FormLabel>Description</FormLabel>
//               <ChakraInput
//                 name="description"
//                 value={newEvent.description}
//                 onChange={handleInputChange}
//               />
//             </FormControl>
//             <FormControl mb={3}>
//               <FormLabel>Image URL</FormLabel>
//               <ChakraInput
//                 name="image"
//                 value={newEvent.image}
//                 onChange={handleInputChange}
//               />
//             </FormControl>
//             <FormControl mb={3}>
//               <FormLabel>Start Time</FormLabel>
//               <ChakraInput
//                 type="datetime-local"
//                 name="startTime"
//                 value={newEvent.startTime}
//                 onChange={handleInputChange}
//               />
//             </FormControl>
//             <FormControl mb={3}>
//               <FormLabel>End Time</FormLabel>
//               <ChakraInput
//                 type="datetime-local"
//                 name="endTime"
//                 value={newEvent.endTime}
//                 onChange={handleInputChange}
//               />
//             </FormControl>
//             <FormControl mb={3}>
//               <FormLabel>Categories (comma separated)</FormLabel>
//               <ChakraInput
//                 name="categories"
//                 value={newEvent.categories}
//                 onChange={handleInputChange}
//               />
//             </FormControl>
//           </ModalBody>

//           <ModalFooter>
//             <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
//               Submit
//             </Button>
//             <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
//               Cancel
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>

//       {/* Displaying Events */}
//       {filteredEvents.length > 0 ? (
//         <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
//           {filteredEvents.map((event, index) => (
//             <Box
//               key={index}
//               p={4}
//               borderWidth="1px"
//               borderRadius="md"
//               bg="gray.50"
//               boxShadow="md"
//               _hover={{ transform: 'scale(1.02)', transition: 'transform 0.2s' }}
//               onClick={() => {
//                 onEventClick(event.id);
//               }}
//             >
//               <VStack align="start" spacing={3}>
//                 <Text fontSize="lg" fontWeight="bold">
//                   {event.title}
//                 </Text>
//                 <Text>{event.description}</Text>
//                 <Image
//                   src={event.image}
//                   alt={event.title}
//                   borderRadius="md"
//                   objectFit="cover"
//                   boxSize="200px"
//                 />
//                 <Text>
//                   <strong>Start Time:</strong> {event.startTime}
//                 </Text>
//                 <Text>
//                   <strong>End Time:</strong> {event.endTime}
//                 </Text>
//                 <Text>
//                   <strong>Categories:</strong>{' '}
//                   {Array.isArray(event.categories) ? event.categories.join(', ') : 'No categories available'}
//                 </Text>
//               </VStack>
//             </Box>
//           ))}
//         </SimpleGrid>
//       ) : (
//         <Text textAlign="center" color="gray.500">
//           No events found.
//         </Text>
//       )}
//     </Box>
//   );
// };

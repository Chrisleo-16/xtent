
const LocationInstructions = () => {
  return (
    <div className="text-sm text-gray-600 bg-green-50 border border-green-200 p-4 rounded-lg">
      <p className="font-medium mb-2 text-green-800">💡 How to set location:</p>
      <ul className="space-y-1 text-green-700">
        <li>• Use the search box above to find your property address</li>
        <li>• Use "Current Location" to get your GPS position</li>
        <li>• Click anywhere on the map to place a pin</li>
        <li>• Drag the marker to fine-tune the exact position</li>
      </ul>
    </div>
  );
};

export default LocationInstructions;

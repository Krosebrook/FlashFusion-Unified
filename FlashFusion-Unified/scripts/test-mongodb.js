const mongoService = require('../src/services/mongoService');

async function testMongoDB() {
  console.log('🔗 Testing MongoDB Connection...');
  
  try {
    // Test basic connection
    await mongoService.connect();
    console.log('✅ MongoDB connection successful!');

    // Test ping
    const pingResult = await mongoService.ping();
    console.log('📡 MongoDB ping:', pingResult ? '✅ Success' : '❌ Failed');

    // Test basic operations
    console.log('\n🧪 Testing basic operations...');

    // Test user creation
    const testUser = await mongoService.createUser({
      email: 'test@flashfusion.ai',
      name: 'Test User',
      preferences: {
        theme: 'dark',
        notifications: true
      }
    });
    console.log('👤 Created test user:', testUser._id);

    // Test conversation creation
    const testConversation = await mongoService.createConversation({
      title: 'Test Conversation',
      summary: 'This is a test conversation',
      participants: [testUser._id.toString()],
      type: 'general'
    });
    console.log('💬 Created test conversation:', testConversation._id);

    // Test message addition
    const testMessage = await mongoService.addMessage(testConversation._id, {
      senderId: testUser._id.toString(),
      content: 'Hello, this is a test message!',
      type: 'text'
    });
    console.log('📝 Added test message:', testMessage._id);

    // Test Notion data storage
    const notionData = await mongoService.saveNotionData(testUser._id.toString(), {
      apiKey: 'test-key',
      databases: [
        { id: 'db1', name: 'Test Database' }
      ],
      lastSync: new Date()
    });
    console.log('📋 Saved Notion data:', notionData._id);

    // Test physics state storage
    const physicsState = await mongoService.savePhysicsState('test-session-123', {
      objects: [
        { id: 'cube1', position: [0, 5, 0], rotation: [0, 0, 0] },
        { id: 'sphere1', position: [2, 8, 0], rotation: [0, 0, 0] }
      ],
      forces: [],
      timestamp: new Date()
    });
    console.log('🎮 Saved physics state:', physicsState._id);

    // Test analytics tracking
    const analyticsEvent = await mongoService.trackEvent({
      userId: testUser._id.toString(),
      event: 'test_event',
      properties: {
        action: 'connection_test',
        success: true
      }
    });
    console.log('📊 Tracked analytics event:', analyticsEvent._id);

    // Test retrieval operations
    console.log('\n📖 Testing retrieval operations...');

    const retrievedUser = await mongoService.getUser(testUser._id);
    console.log('👤 Retrieved user:', retrievedUser.name);

    const userConversations = await mongoService.getConversations(testUser._id.toString());
    console.log('💬 User conversations count:', userConversations.length);

    const conversationMessages = await mongoService.getMessages(testConversation._id);
    console.log('📝 Conversation messages count:', conversationMessages.length);

    const userNotionData = await mongoService.getNotionData(testUser._id.toString());
    console.log('📋 Notion databases count:', userNotionData?.databases?.length || 0);

    const sessionPhysicsState = await mongoService.getPhysicsState('test-session-123');
    console.log('🎮 Physics objects count:', sessionPhysicsState?.objects?.length || 0);

    const userAnalytics = await mongoService.getAnalytics(testUser._id.toString());
    console.log('📊 User analytics events count:', userAnalytics.length);

    console.log('\n🧹 Cleaning up test data...');

    // Clean up test data
    await mongoService.getCollection('users').deleteOne({ _id: testUser._id });
    await mongoService.getCollection('conversations').deleteOne({ _id: testConversation._id });
    await mongoService.getCollection('notion_data').deleteOne({ userId: testUser._id.toString() });
    await mongoService.getCollection('physics_sessions').deleteOne({ sessionId: 'test-session-123' });
    await mongoService.getCollection('analytics').deleteOne({ _id: analyticsEvent._id });

    console.log('✅ All tests passed successfully!');
    console.log('\n📋 MongoDB Collections Available:');
    console.log('   - users: User profiles and preferences');
    console.log('   - conversations: Chat threads and participants');
    console.log('   - notion_data: Notion API integration data');
    console.log('   - physics_sessions: Rapier physics simulation states');
    console.log('   - analytics: User interaction tracking');

  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoService.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  testMongoDB();
}

module.exports = testMongoDB;
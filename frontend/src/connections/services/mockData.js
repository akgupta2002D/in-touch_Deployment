const MOCK_CONNECTIONS = [
    {
        connectionId: 1,
        userId: 42, 
        name: "Jane Doe",
        status: "connected", 
        connectionType: "friend", 
        reminderFrequency: 14, 
        lastReachedOut: "2025-11-06T10:00:00.000Z", 
        notes: "Met at demo day, wants a follow-up in November.",
        createdAt: "2025-10-01T10:00:00.000Z"
    },
    {
        connectionId: 2,
        userId: 43,
        name: "Rahul Singh",
        status: "connected",
        connectionType: "close_friend",
        reminderFrequency: 7,
        lastReachedOut: "2025-11-12T17:30:00.000Z", 
        notes: "Investor intro pending.",
        createdAt: "2025-09-20T17:30:00.000Z"
    },
    {
        connectionId: 3,
        userId: 44,
        name: "Amara Li",
        status: "connected",
        connectionType: "acquaintance",
        reminderFrequency: 30,
        lastReachedOut: "2025-10-07T12:15:00.000Z", 
        notes: "Asked to hear about new project when ready.",
        createdAt: "2025-09-10T12:15:00.000Z"
    },
    {
        connectionId: 4,
        userId: 45,
        name: "Carlos Mendez",
        status: "connected",
        connectionType: "colleague",
        reminderFrequency: 21,
        lastReachedOut: "2025-09-15T09:00:00.000Z",
        notes: "Works at Acme Corp, interested in partnership.",
        createdAt: "2025-09-01T08:00:00.000Z"
    },
    {
        connectionId: 5,
        userId: 46,
        name: "Emily Chen",
        status: "connected",
        connectionType: "mentor",
        reminderFrequency: 60,
        lastReachedOut: "2025-10-20T14:45:00.000Z",
        notes: "Mentor from university, meet quarterly.",
        createdAt: "2025-09-05T10:00:00.000Z"
    },
    {
        connectionId: 6,
        userId: 47,
        name: "Samir Patel",
        status: "connected",
        connectionType: "friend",
        reminderFrequency: 14,
        lastReachedOut: "2025-09-25T16:30:00.000Z",
        notes: "Planning a trip together.",
        createdAt: "2025-09-10T12:00:00.000Z"
    },
    {
        connectionId: 7,
        userId: 48,
        name: "Olivia Brown",
        status: "connected",
        connectionType: "acquaintance",
        reminderFrequency: 30,
        lastReachedOut: "2025-10-02T11:00:00.000Z",
        notes: "Met at conference, works in AI.",
        createdAt: "2025-09-15T09:00:00.000Z"
    },
    {
        connectionId: 8,
        userId: 49,
        name: "Liam Wilson",
        status: "connected",
        connectionType: "colleague",
        reminderFrequency: 21,
        lastReachedOut: "2025-11-01T13:20:00.000Z",
        notes: "Collaborating on project.",
        createdAt: "2025-09-20T11:00:00.000Z"
    },
    {
        connectionId: 9,
        userId: 50,
        name: "Priya Sharma",
        status: "connected",
        connectionType: "close_friend",
        reminderFrequency: 7,
        lastReachedOut: "2025-10-10T18:00:00.000Z",
        notes: "Birthday in October.",
        createdAt: "2025-09-25T13:00:00.000Z"
    },
    {
        connectionId: 10,
        userId: 51,
        name: "Noah Kim",
        status: "connected",
        connectionType: "friend",
        reminderFrequency: 14,
        lastReachedOut: "2025-09-30T15:00:00.000Z",
        notes: "Enjoys hiking.",
        createdAt: "2025-09-28T10:00:00.000Z"
    },
    {
        connectionId: 11,
        userId: 52,
        name: "Sophia Garcia",
        status: "connected",
        connectionType: "acquaintance",
        reminderFrequency: 30,
        lastReachedOut: "2025-11-14T10:30:00.000Z",
        notes: "Met at networking event.",
        createdAt: "2025-10-01T09:00:00.000Z"
    },
    {
        connectionId: 12,
        userId: 53,
        name: "Ethan Lee",
        status: "connected",
        connectionType: "colleague",
        reminderFrequency: 21,
        lastReachedOut: "2025-10-18T12:00:00.000Z",
        notes: "Works in marketing.",
        createdAt: "2025-10-05T11:00:00.000Z"
    },
    {
        connectionId: 13,
        userId: 54,
        name: "Mia Martinez",
        status: "connected",
        connectionType: "mentor",
        reminderFrequency: 60,
        lastReachedOut: "2025-09-12T17:00:00.000Z",
        notes: "Career advice.",
        createdAt: "2025-09-10T10:00:00.000Z"
    },
    {
        connectionId: 14,
        userId: 55,
        name: "Lucas Rossi",
        status: "connected",
        connectionType: "friend",
        reminderFrequency: 14,
        lastReachedOut: "2025-10-25T19:00:00.000Z",
        notes: "Soccer teammate.",
        createdAt: "2025-10-01T15:00:00.000Z"
    },
    {
        connectionId: 15,
        userId: 56,
        name: "Ava Johnson",
        status: "connected",
        connectionType: "close_friend",
        reminderFrequency: 7,
        lastReachedOut: "2025-11-16T08:00:00.000Z",
        notes: "Travel buddy.",
        createdAt: "2025-10-10T08:00:00.000Z"
    },
    {
        connectionId: 16,
        userId: 57,
        name: "William Zhang",
        status: "connected",
        connectionType: "colleague",
        reminderFrequency: 21,
        lastReachedOut: "2025-09-05T10:00:00.000Z",
        notes: "Works in finance.",
        createdAt: "2025-09-01T09:00:00.000Z"
    },
    {
        connectionId: 17,
        userId: 58,
        name: "Isabella Nguyen",
        status: "connected",
        connectionType: "acquaintance",
        reminderFrequency: 30,
        lastReachedOut: "2025-10-12T13:00:00.000Z",
        notes: "Met at book club.",
        createdAt: "2025-09-15T10:00:00.000Z"
    }
];

export default MOCK_CONNECTIONS;
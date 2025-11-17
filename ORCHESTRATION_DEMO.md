# 🤖 AI Orchestration Center - Demo Guide

## What's Been Built

A **complete event-driven orchestration dashboard** that demonstrates how AI automates customer service tasks that agents normally handle manually.

## 🎯 Core Concept

Instead of three separate chat interfaces, you now have **ONE ORCHESTRATION CENTER** that shows:
- Event triggers (customer/business/driver actions)
- AI reasoning process
- Automated multi-party communication
- Multi-channel actions (SMS, calls, push, chat)
- Business metrics and cost savings

## 🚀 How to Run

1. **Start Backend Server:**
   ```bash
   npm run server
   ```

2. **Start Frontend (separate terminal):**
   ```bash
   npm run dev
   ```

3. **Open Browser:**
   ```
   http://localhost:3000
   ```

## 📱 Demo Flow

### Landing Page
- Shows business value proposition
- Single "Launch Demo" button
- Emphasizes customer service automation

### Orchestration Center (`/orchestration`)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Metrics: Auto-Resolved | Response Time | Cost | etc.   │
├──────────┬─────────────────────────┬────────────────────┤
│          │                         │                    │
│ Scenario │   Event Timeline        │  Decision Tree     │
│ Triggers │   (Center Stream)       │  (AI Reasoning)    │
│ (Left)   │                         │  (Right)           │
│          │                         │                    │
├──────────┴─────────────────────────┴────────────────────┤
│          Multi-Channel Activity (SMS/Call/Push/Chat)    │
└─────────────────────────────────────────────────────────┘
```

## 🎬 6 Live Scenarios

Click any scenario button to trigger orchestration:

### 1. 🍕 Customer Adds Item Post-Checkout
**Trigger:** Customer wants to add Garlic Bread to order in preparation

**AI Orchestration:**
- ✅ Checks order status (modifiable window)
- ✅ Messages business for prep time update
- ✅ Notifies customer of pending confirmation
- ✅ Updates driver with new ETA

**Channels Used:** Push (customer), Chat (business), Push (driver)

### 2. 🥬 Restaurant Missing Ingredient
**Trigger:** Business reports out of Pepperoni

**AI Orchestration:**
- ✅ Offers alternative (Italian Sausage)
- ✅ Sends push + SMS to customer
- ✅ Waits for customer response (3min timeout)
- ✅ Notifies business of choice

**Channels Used:** Push + SMS (customer), Chat (business)

### 3. 🚪 Driver: No Answer at Door
**Trigger:** Driver reports customer not answering

**AI Orchestration:**
- ✅ Calls customer immediately
- ✅ Sends backup SMS
- ✅ Waits 5 minutes
- ✅ Schedules second attempt
- ✅ Escalates to support if still no answer

**Channels Used:** Call + SMS (customer), Push (driver)

### 4. ⏰ Proactive Delay Notification
**Trigger:** Restaurant kitchen backed up - 15min delay

**AI Orchestration:**
- ✅ Proactively notifies customer with new ETA
- ✅ Offers $5 voucher for inconvenience
- ✅ Updates driver pickup time
- ✅ Prevents inbound support tickets

**Channels Used:** Push + SMS (customer), Push (driver)

### 5. 📍 Address Mismatch
**Trigger:** Driver can't find address (GPS mismatch)

**AI Orchestration:**
- ✅ Sends SMS quick-reply to customer
- ✅ Provides map link for confirmation
- ✅ Enables driver-customer call option
- ✅ 10-minute resolution window

**Channels Used:** SMS + Push (customer), Chat (driver)

### 6. 💰 Quality Issue / Auto-Refund
**Trigger:** Customer reports missing fries

**AI Orchestration:**
- ✅ Checks customer tier (Premium)
- ✅ Auto-approves refund < $10
- ✅ Confirms with customer
- ✅ Flags merchant for quality review

**Channels Used:** Push (customer), Chat (business)

## 🧠 What You'll See

### Event Timeline (Center)
- Chronological stream of all events
- Color-coded by actor (customer/business/driver/system)
- Shows event → reasoning → actions flow
- Click any event to see details

### Decision Tree (Right Panel)
When you select an event, see:

1. **Signals Analyzed**
   - Order status, time windows, customer tier
   - Policy constraints, SLA timers

2. **Rules Applied**
   - Business rules that fired
   - Policy guardrails
   - Escalation thresholds

3. **AI Decision**
   - Final decision with justification
   - Confidence score (0-100%)
   - Recommended actions

4. **Actions Executed**
   - Each channel message sent
   - Individual costs
   - Success/failure status

### Multi-Channel Activity (Bottom)
Tabs for each channel type:
- **All**: Combined view of all communications
- **SMS**: Text messages via Twilio
- **Call**: Voice calls with transcripts
- **Push**: In-app notifications
- **Chat**: Platform messages

**Shows for each:**
- Target recipient
- Message content
- Delivery status
- Cost breakdown
- Timestamp

## 📊 Business Metrics (Top Bar)

Real-time tracking of:
- **Auto-Resolved %**: Tickets handled without human intervention
- **Avg Response Time**: 3s vs 2+ min human
- **Cost Saved**: Cumulative savings vs agent cost
- **Escalations**: Cases requiring human review
- **Total Events**: Activity volume

## 💡 Key Demo Points

### For Stakeholders:
1. **Speed**: 3-second response vs 2+ minutes
2. **Cost**: $0.08 per ticket vs $3-5 human agent
3. **Scalability**: Handles unlimited concurrent issues
4. **Consistency**: Same quality 24/7

### For Technical Audiences:
1. **Event-Driven Architecture**: Clean separation of concerns
2. **Decision Transparency**: Full reasoning visibility
3. **Multi-Channel Orchestration**: Coordinated communication
4. **Confidence-Based Escalation**: Smart handoff to humans

### For Product Teams:
1. **Customer Experience**: Faster, proactive communication
2. **Support Reduction**: 90%+ auto-resolution
3. **Quality Improvement**: Consistent service delivery
4. **Data Insights**: Full audit trail of all decisions

## 🎨 UI Highlights

- **Color-Coded Actors**: Blue (customer), Orange (business), Green (driver), Purple (system)
- **Real-Time Updates**: Events stream in with smooth animations
- **Cost Transparency**: Every action shows exact cost
- **Confidence Scoring**: Visual indicators for decision certainty
- **Responsive Design**: Works on all screen sizes

## 🔧 Technical Architecture

```
User Action (Scenario Trigger)
    ↓
Event Created
    ↓
AI Analyzes (Signals + Rules)
    ↓
Decision Tree Generated
    ↓
Multi-Channel Actions Executed
    ↓
Results Tracked & Displayed
    ↓
Metrics Updated
```

## 🎯 Next Steps (Future Enhancements)

1. **Real AI Integration**: Connect to live Claude API for dynamic reasoning
2. **Actual Twilio**: Send real SMS/calls during demo
3. **Agent Handoff UI**: Build escalation interface
4. **Historical Playback**: Replay past scenarios
5. **A/B Testing**: Compare AI vs human performance
6. **Custom Scenarios**: User-defined trigger creation

## 📝 Notes

- Currently uses **simulated** AI reasoning (pre-defined responses)
- Multi-channel messages are **logged** but not actually sent
- Metrics are **calculated** from scenario outcomes
- All scenarios designed to show **90%+ auto-resolution**

---

**Built to demonstrate the power of AI-driven customer service orchestration** 🚀

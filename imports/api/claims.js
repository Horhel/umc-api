import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';

import { Policies } from './policies';

export const VOTE_YES = 0;
export const VOTE_NO = 1;
export const VOTE_NMI = 2;
export const VOTE_FRAUD = 3;
export const VOTE_INAPPROPRIATE = 4;
const VOTE_TYPES_MAX = 10;

export const Claims = new Mongo.Collection('claims');

if (Meteor.isServer) {
    // Only publish active claims
    Meteor.publish('claims', function() {
        return Claims.find({ active: true });
    });
}

Meteor.methods({
    'claims.insert'(ask) {
        check(ask, Match.Integer)

        // Ensure user logged in
        if (!this.userId)
            throw new Meteor.Error('not-authorized');

        // Insert claim
        Claims.insert({
            active: true,
            ask,
            owner: this.userId,
            votes: {}, // userId -> vote
            voteCounts: new Array(VOTE_TYPES_MAX).fill(0), // voteType -> count
            createdAt: new Date(),
        });
    },

    'claims.vote'(claimId, voteNew) {
        check(claimId, String);
        check(voteNew, Match.Integer);

        // Check possible vote values
        if (![VOTE_YES, VOTE_NO, VOTE_NMI, VOTE_FRAUD, VOTE_INAPPROPRIATE].includes(voteNew))
            throw new Meteor.Error('invalid-argument');

        // Ensure user logged in
        if (!this.userId)
            throw new Meteor.Error('not-authorized');

        // Ensure user doesn't own active claim
        const claim = Claims.findOne(claimId);
        if (claim.owner === this.userId || !claim.active)
            throw new Meteor.Error('not-authorized');

        // Get maps
        var votes = claim.votes;
        var voteCounts = claim.voteCounts;

        // Handle old vote
        if (votes[this.userId] !== undefined)
            voteCounts[votes[this.userId]]--;

        // Handle new vote
        votes[this.userId] = voteNew;
        voteCounts[voteNew]++;

        // Update claim
        Claims.update(claimId, { $set: { votes, voteCounts } });
    },

    'claims.setActive'(claimId, active) {
        check(claimId, String);

        // Ensure user owns claim
        const claim = Claims.findOne(claimId);
        if (claim.owner !== this.userId)
            throw new Meteor.Error('not-authorized');

        // Update claim
        Claims.update(claimId, { $set: { active } });
    },
});
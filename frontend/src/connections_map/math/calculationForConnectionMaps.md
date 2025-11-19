# Brainstorm: Metric for When to Reach Out

## Factors to Consider

- **Last Contact Date:** Time since last interaction.
- **Preferred Contact Frequency:** User-defined or inferred from history.
<!-- - **Event Triggers:** Birthdays, anniversaries, or shared events. **Later -->
<!-- - **Response Time:** How quickly the other person responds. -->
<!-- - **Mutual Initiation:** Balance of who initiates contact. -->
<!-- - **Contextual Importance:** Work, personal, or project-based relationships. -->

## Calculation

Based on those two parameters we can find two important metrics.
Distance on the map = Frequency - ( Today's Date - Last Contact Date )
    E.g. Frequency is 7, they contact 15 days ago calculated by ( Today's Date - Last Contact Date )
            Distance on the map  = 7 - 15 = -8
            As long as the distance is positive, it should be green and should be fairly close to the user.
            As it gets negative, the double the distance compared to frequency is the threshold  - end. (the connection will be in the outermost part.)
        Frequency is 14, they contact 7 days ago, it should still be in green.
            14 days, but 13 days ago, should become yellow.
            Anything past 14 days it will be red.
            Double the 14 days, it will be flamming red.
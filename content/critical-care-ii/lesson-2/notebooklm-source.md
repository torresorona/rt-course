# NotebookLM Source: Ventilator Classification & Modes of Ventilation

This lesson covers how mechanical ventilators are classified and how the different modes of ventilation work. Understanding the underlying framework of ventilator classification makes it much easier to learn and troubleshoot any specific ventilator in the ICU.

## The Equation of Motion

Everything in mechanical ventilation flows from Newton's equation of motion: pressure equals airway resistance times flow plus volume divided by compliance. This means that the pressure required to deliver a breath depends on how stiff the lungs are, how much flow you are delivering, and how much resistance there is in the airway. When compliance decreases or resistance increases, more pressure is needed to deliver the same volume.

## Classification Framework

Ventilators are classified based on five components: input power, power conversion and transmission, control circuit, control variables, and phase variables.

For input power, pneumatic ventilators only need a 50 psi gas source — think of Bird ventilators, IPPB units, and transport vents for MRI where you cannot bring electricity. Electric ventilators only need a wall outlet — common for home ventilators and some transport units. Most ICU ventilators are combination powered, needing both a gas source and electricity.

Power conversion and transmission refers to the drive mechanism — how the ventilator actually moves the gas. This can be a bellows, a piston, or a turbine. The output control valve, also called the demand valve or inspiratory valve, is what controls how gas is delivered to the patient and can shape the flow waveform.

The control circuit is the brain of the ventilator. Modern ICU ventilators use electronic control circuits with microprocessors. Older designs used mechanical, pneumatic, or fluidic circuits.

## Control Variables — Only One at a Time

This is critical: a ventilator can only control one variable at a time during inspiration. That variable is called the control variable or control mode. The four options are pressure, volume, flow, and time.

In pressure control, the ventilator holds the airway pressure constant at the set level and delivers whatever volume fits at that pressure. This means volume is variable. If the patient's lungs get stiffer — compliance decreases — the same pressure will deliver less volume. If resistance increases, same thing. This is important clinically: a patient in pressure control who gets worse will drop their tidal volume, so you need to watch the exhaled volume closely.

In volume control, the ventilator delivers the set tidal volume regardless of the pressure needed. Volume is constant, pressure is variable. If compliance decreases or resistance increases, pressure goes up. This is also important: if a patient develops a mucus plug and resistance skyrockets, the pressure alarm will sound — that is a signal something is wrong.

Flow and time control are used less often. Flow control is rarely the primary variable. Time control is used mainly in neonatal ventilation.

## Phase Variables

Phase variables describe what happens at each phase of the breath cycle. There are four phases: trigger, target, cycle, and baseline.

The trigger is what starts inspiration. A time trigger means the ventilator starts a breath based on the set respiratory rate — at a rate of 10, a breath is delivered every 6 seconds. A pressure trigger means the ventilator senses a drop in baseline pressure caused by the patient's inspiratory effort — the sensitivity is typically set at negative 0.5 to negative 2.0 cmH₂O. A flow trigger means the ventilator senses a drop in the continuous bias flow running through the circuit — this requires less patient effort than pressure triggering and is more commonly used in modern ICUs.

The target is the variable controlled during the inspiratory phase — essentially the same as the control variable. It is sometimes called the limit if it doubles as an alarm condition.

The cycle is the variable that ends inspiration and allows exhalation to begin. In volume control, the cycle is usually volume — the breath ends when the set volume has been delivered. In pressure support, the cycle is flow — the breath ends when the patient's inspiratory flow decelerates to 25 percent of the peak flow. In pressure control, the cycle is usually time.

The baseline is the pressure maintained during exhalation, which is PEEP.

## Breath Types

Four breath types emerge from different combinations of phase variables.

A mandatory or controlled breath is time-triggered, ventilator-targeted, and ventilator-cycled. The ventilator does all the work of breathing. The patient does not contribute.

An assisted breath is patient-triggered but still ventilator-targeted and ventilator-cycled. The patient only does the work to trigger the breath; the rest is handled by the ventilator. The only work is pulling down hard enough on the circuit to trigger the demand valve.

A spontaneous breath is patient-triggered, baseline-targeted, and patient-cycled. The patient does all the work of breathing. On a pressure-time scalar, spontaneous unsupported breaths show a negative deflection during inspiration and positive during expiration — the opposite of positive pressure breaths.

A supported breath is patient-triggered, pressure-targeted, and flow-cycled. This is what pressure support provides. The patient triggers the breath and sets the rhythm, but the ventilator augments inspiratory effort by applying a set pressure until flow decreases to 25 percent of the peak.

## Modes of Ventilation

A mode combines breath types and timing algorithms to distribute the work of breathing between the patient and the ventilator.

Assist/Control, or A/C, also called CMV for continuous mandatory ventilation, is the initial rest mode. Every breath is either a mandatory time-triggered breath or an assisted patient-triggered breath. In either case, the ventilator controls the inspiratory phase and cycles the breath. The patient never takes a fully spontaneous breath in A/C mode. This is ideal for very sick patients who need full support.

SIMV, Synchronized Intermittent Mandatory Ventilation, is a transitional mode that delivers a set number of mandatory breaths per minute while allowing spontaneous breathing between them. The timing algorithm synchronizes the mandatory breaths to occur in phase with the patient's own effort — this is what makes it "synchronized." In plain SIMV, the spontaneous breaths between mandatory breaths are fully unsupported. In SIMV plus PS, spontaneous breaths are augmented with pressure support. SIMV is both a rest mode at higher mandatory rates and a weaning mode as the rate is gradually reduced.

CSV, Continuous Spontaneous Ventilation, is the ventilator equivalent of CPAP. The patient breathes spontaneously with the circuit open at or above atmospheric pressure. The ventilator provides no inspiratory support — just a continuous elevated baseline pressure. This mode is used to test whether a patient can breathe on their own before extubation.

PSV, Pressure Support Ventilation, is CPAP with added inspiratory pressure support. Every breath is patient-triggered and pressure-supported. The ventilator applies a set pressure above baseline when the patient inhales, and cycles off when the inspiratory flow drops to 25 percent of peak flow. The pressure support level can be set high to support fatigued muscles or low to provide just enough to overcome the resistance of the endotracheal tube.

APRV, Airway Pressure Release Ventilation, is a time-cycled, dual-level pressure mode. It goes by many names: BiLevel, BiVent, BiPhasic, PCV+, DuoPAP. It uses two pressure levels — P-High and P-Low — and two time settings — T-High and T-Low. The key feature is an inverse ratio: T-High is very long and T-Low is very short. The patient spends most of the time at P-High, which is like a high CPAP that recruits alveoli and maintains oxygenation. During the brief T-Low release, pressure drops to P-Low and CO₂ is exhaled. Spontaneous breathing can occur throughout the cycle. APRV is used for refractory hypoxemia in ARDS patients.

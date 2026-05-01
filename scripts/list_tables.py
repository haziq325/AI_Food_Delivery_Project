from pgmpy.models import DiscreteBayesianNetwork
from pgmpy.factors.discrete import TabularCPD
from pgmpy.inference import VariableElimination
model = DiscreteBayesianNetwork([
(&#39;Education&#39;, &#39;Interview&#39;),
(&#39;Experience&#39;, &#39;Interview&#39;),
(&#39;Interview&#39;, &#39;HiringDecision&#39;)
])

# Education
cpd_education = TabularCPD(
variable=&#39;Education&#39;,
variable_card=2,
values=[[0.65], [0.35]],
state_names={&#39;Education&#39;: [&#39;High&#39;, &#39;Low&#39;]}
)
# Experience
cpd_experience = TabularCPD(
variable=&#39;Experience&#39;,
variable_card=2,
values=[[0.5], [0.5]],
state_names={&#39;Experience&#39;: [&#39;Experienced&#39;, &#39;Inexperienced&#39;]}
)

# Interview | Education, Experience
cpd_interview = TabularCPD(
variable=&#39;Interview&#39;,
variable_card=2,
values=[
[0.90, 0.70, 0.60, 0.30], # Good
[0.10, 0.30, 0.40, 0.70] # Bad
],
evidence=[&#39;Education&#39;, &#39;Experience&#39;],
evidence_card=[2, 2],
state_names={
&#39;Interview&#39;: [&#39;Good&#39;, &#39;Bad&#39;],
&#39;Education&#39;: [&#39;High&#39;, &#39;Low&#39;],
&#39;Experience&#39;: [&#39;Experienced&#39;, &#39;Inexperienced&#39;]
}
)
# HiringDecision | Interview
cpd_hiring = TabularCPD(
variable=&#39;HiringDecision&#39;,
variable_card=2,
values=[
[0.85, 0.20], # Hired
[0.15, 0.80] # NotHired
],
evidence=[&#39;Interview&#39;],
evidence_card=[2],
state_names={
&#39;HiringDecision&#39;: [&#39;Hired&#39;, &#39;NotHired&#39;],
&#39;Interview&#39;: [&#39;Good&#39;, &#39;Bad&#39;]
}
)
model.add_cpds(
cpd_education,
cpd_experience,
cpd_interview,
cpd_hiring
)
assert model.check_model()
inference = VariableElimination(model)
result = inference.query(
variables=[&#39;HiringDecision&#39;],
evidence={&#39;Education&#39;: &#39;High&#39;, &#39;Experience&#39;: &#39;Experienced&#39;}
)
print(result)
pub fn to_vec_string(input: Vec<&str>) -> Vec<String>
{
    let strings: Vec<String> = input.iter().map(|&s|s.into()).collect();
    return strings
}